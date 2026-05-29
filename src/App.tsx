import { useEffect, useMemo, useRef, useState } from "react";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import type { ResumeData } from "./types";
import { ResumeDocument } from "./pdf/ResumeDocument";
import { ResumeForm } from "./components/ResumeForm";
import { loadResume, saveResume } from "./lib/storage";
import { sampleData, emptyData } from "./lib/sampleData";
import { DONATION_URL, REPO_URL } from "./config";

/** Debounce so the (relatively heavy) PDF preview doesn't re-render on every keystroke. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [data, setData] = useState<ResumeData>(() => loadResume());
  const debouncedData = useDebounced(data, 400);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveResume(data);
  }, [data]);

  const fileSlug = useMemo(
    () => (data.contact.fullName || "resume").replace(/\s+/g, "-"),
    [data.contact.fullName],
  );

  const previewDoc = useMemo(() => <ResumeDocument data={debouncedData} />, [debouncedData]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}-cv-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ResumeData;
        setData({
          ...emptyData,
          ...parsed,
          contact: { ...emptyData.contact, ...parsed.contact },
          settings: { ...emptyData.settings, ...parsed.settings },
        });
      } catch {
        alert("El archivo no es un JSON válido de CV Builder.");
      }
    };
    reader.readAsText(file);
  };

  const downloadPdf = async () => {
    const blob = await pdf(<ResumeDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}-CV.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CV</span>
          <div>
            <h1>CV Builder</h1>
            <p>Genera un CV moderno y compatible con ATS</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
            Importar JSON
          </button>
          <button className="btn-ghost" onClick={exportJson}>
            Exportar JSON
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm("¿Cargar datos de ejemplo? Se reemplazará el contenido actual.")) {
                setData(sampleData);
              }
            }}
          >
            Ejemplo
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm("¿Empezar desde cero? Se borrará el contenido actual.")) {
                setData(emptyData);
              }
            }}
          >
            Limpiar
          </button>
          {DONATION_URL ? (
            <a className="btn-donate" href={DONATION_URL} target="_blank" rel="noopener noreferrer">
              ♥ Donar
            </a>
          ) : null}
          <button className="btn-primary" onClick={downloadPdf}>
            Descargar PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJson(file);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      <main className="layout">
        <aside className="editor">
          <ResumeForm data={data} onChange={setData} />
          <div className="editor-footer">
            <PDFDownloadLink
              document={<ResumeDocument data={data} />}
              fileName={`${fileSlug}-CV.pdf`}
              className="btn-primary block"
            >
              {({ loading }) => (loading ? "Preparando PDF…" : "Descargar PDF")}
            </PDFDownloadLink>
            <p className="footer-note">
              Gratis y de código abierto.
              {DONATION_URL ? (
                <>
                  {" "}
                  <a href={DONATION_URL} target="_blank" rel="noopener noreferrer">
                    Apóyalo con una donación
                  </a>
                  .
                </>
              ) : null}
              {REPO_URL ? (
                <>
                  {" "}
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                    Ver código
                  </a>
                  .
                </>
              ) : null}
            </p>
          </div>
        </aside>

        <section className="preview">
          <PDFViewer className="pdf-viewer" showToolbar>
            {previewDoc}
          </PDFViewer>
        </section>
      </main>
    </div>
  );
}
