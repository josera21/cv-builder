import { useEffect, useMemo, useRef, useState } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import type { ResumeData } from "./types";
import { ResumeDocument } from "./pdf/ResumeDocument";
import { ResumeForm } from "./components/ResumeForm";
import { TailorPanel } from "./components/TailorPanel";
import { loadResume, saveResume } from "./lib/storage";
import { sampleData, emptyData } from "./lib/sampleData";
import { DONATION_URL, REPO_URL } from "./config";

const VARIANT_STORAGE_KEY = "cv-builder:variant";

/** Debounce so the (relatively heavy) PDF preview doesn't re-render on every keystroke. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function loadVariant(): ResumeData | null {
  try {
    const raw = localStorage.getItem(VARIANT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResumeData) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [data, setData] = useState<ResumeData>(() => loadResume());
  const [variant, setVariant] = useState<ResumeData | null>(() => loadVariant());
  const [view, setView] = useState<"original" | "variant">("original");
  const debouncedData = useDebounced(data, 400);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveResume(data);
  }, [data]);

  useEffect(() => {
    try {
      if (variant) localStorage.setItem(VARIANT_STORAGE_KEY, JSON.stringify(variant));
      else localStorage.removeItem(VARIANT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [variant]);

  const showingVariant = view === "variant" && !!variant;
  const activeData = showingVariant ? (variant as ResumeData) : debouncedData;
  const downloadData = showingVariant ? (variant as ResumeData) : data;

  const fileSlug = useMemo(
    () => (data.contact.fullName || "resume").replace(/\s+/g, "-"),
    [data.contact.fullName],
  );

  const previewDoc = useMemo(() => <ResumeDocument data={activeData} />, [activeData]);

  const handleVariant = (v: ResumeData) => {
    setVariant(v);
    setView("variant");
  };

  const clearVariant = () => {
    setVariant(null);
    setView("original");
  };

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
    const blob = await pdf(<ResumeDocument data={downloadData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}-CV${showingVariant ? "-adaptado" : ""}.pdf`;
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
            Descargar PDF{showingVariant ? " (adaptado)" : ""}
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
          <TailorPanel
            data={data}
            onVariant={handleVariant}
            hasVariant={!!variant}
            onClearVariant={clearVariant}
          />
          <ResumeForm data={data} onChange={setData} />
          <div className="editor-footer">
            <button className="btn-primary block" onClick={downloadPdf}>
              Descargar PDF{showingVariant ? " (adaptado)" : ""}
            </button>
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
          <div className="preview-tabs">
            <button
              className={`tab ${!showingVariant ? "tab-active" : ""}`}
              onClick={() => setView("original")}
            >
              Original
            </button>
            <button
              className={`tab ${showingVariant ? "tab-active" : ""}`}
              onClick={() => variant && setView("variant")}
              disabled={!variant}
              title={variant ? "" : "Genera una variante en “Adaptar a una oferta”"}
            >
              Adaptado{variant ? "" : " (vacío)"}
            </button>
          </div>
          <PDFViewer className="pdf-viewer" showToolbar>
            {previewDoc}
          </PDFViewer>
        </section>
      </main>
    </div>
  );
}
