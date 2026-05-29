import { useState } from "react";
import type { ResumeData } from "../types";
import { analyzeJobMatch, adaptResumeLocally, type JobMatchResult } from "../lib/jobMatch";
import {
  loadAISettings,
  saveAISettings,
  tailorResumeWithAI,
  DEFAULT_MODELS,
  PROVIDER_LABELS,
  type AISettings,
  type AIProvider,
} from "../lib/ai";

const JD_STORAGE_KEY = "cv-builder:jd";

interface Props {
  /** The original resume (source of truth). */
  data: ResumeData;
  /** Called with a freshly generated adapted variant. */
  onVariant: (variant: ResumeData) => void;
  hasVariant: boolean;
  onClearVariant: () => void;
}

function ScoreBar({ result }: { result: JobMatchResult }) {
  const color = result.score >= 70 ? "#16a34a" : result.score >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="score">
      <div className="score-head">
        <span className="score-label">Coincidencia con la oferta</span>
        <span className="score-value" style={{ color }}>{result.score}%</span>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${result.score}%`, background: color }} />
      </div>
    </div>
  );
}

export function TailorPanel({ data, onVariant, hasVariant, onClearVariant }: Props) {
  const [jobDescription, setJobDescription] = useState(
    () => localStorage.getItem(JD_STORAGE_KEY) ?? "",
  );
  const [analysis, setAnalysis] = useState<JobMatchResult | null>(null);
  const [ai, setAi] = useState<AISettings>(() => loadAISettings());
  const [showAi, setShowAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const persistJd = (value: string) => {
    setJobDescription(value);
    try {
      localStorage.setItem(JD_STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  const updateAi = (patch: Partial<AISettings>) => {
    const next = { ...ai, ...patch };
    setAi(next);
    saveAISettings(next);
  };

  const requireJd = (): boolean => {
    if (!jobDescription.trim()) {
      setError("Pega primero la descripción del trabajo.");
      return false;
    }
    return true;
  };

  const runLocal = () => {
    setError(null);
    setInfo(null);
    if (!requireJd()) return;
    const result = analyzeJobMatch(data, jobDescription);
    setAnalysis(result);
    const variant = adaptResumeLocally(data, jobDescription);
    onVariant(variant);
    setInfo("Variante adaptada creada (reordenando tu contenido). Revísala en la pestaña “Adaptado”.");
  };

  const runAi = async () => {
    setError(null);
    setInfo(null);
    if (!requireJd()) return;
    if (!ai.apiKey.trim()) {
      setError("Ingresa tu API key para usar la IA.");
      setShowAi(true);
      return;
    }
    setLoading(true);
    try {
      setAnalysis(analyzeJobMatch(data, jobDescription));
      const variant = await tailorResumeWithAI(data, jobDescription, ai);
      onVariant(variant);
      setInfo("Variante adaptada con IA creada. Revísala en la pestaña “Adaptado”.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido al llamar a la IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-block tailor">
      <div className="section-summary tailor-summary">🎯 Adaptar a una oferta</div>
      <div className="section-body">
        <p className="tailor-help">
          Pega la descripción del trabajo y genera una <strong>variante adaptada</strong> de tu CV.
          Tu CV original no se modifica.
        </p>

        <label className="field">
          <span className="field-label">Descripción del trabajo</span>
          <textarea
            className="field-input"
            rows={7}
            value={jobDescription}
            placeholder="Pega aquí la oferta completa (responsabilidades, requisitos, stack...)"
            onChange={(e) => persistJd(e.target.value)}
          />
        </label>

        <div className="tailor-actions">
          <button type="button" className="btn-primary" onClick={runLocal}>
            Analizar y adaptar (gratis)
          </button>
          <button
            type="button"
            className="btn-ai"
            onClick={runAi}
            disabled={loading}
          >
            {loading ? "Adaptando con IA…" : "✨ Adaptar con IA"}
          </button>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {info ? <div className="alert alert-info">{info}</div> : null}

        {analysis ? (
          <div className="analysis">
            <ScoreBar result={analysis} />
            {analysis.matched.length > 0 ? (
              <div className="kw-group">
                <span className="kw-title">En tu CV ({analysis.matched.length})</span>
                <div className="chips">
                  {analysis.matched.map((k) => (
                    <span key={k.key} className="chip chip-ok">{k.label}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {analysis.missing.length > 0 ? (
              <div className="kw-group">
                <span className="kw-title">Faltan / refuerza ({analysis.missing.length})</span>
                <div className="chips">
                  {analysis.missing.map((k) => (
                    <span key={k.key} className="chip chip-miss">{k.label}</span>
                  ))}
                </div>
                <p className="kw-hint">
                  Añade solo las que realmente domines (en Habilidades o en tus logros).
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasVariant ? (
          <button type="button" className="btn-ghost-dark" onClick={onClearVariant}>
            Descartar variante adaptada
          </button>
        ) : null}

        <button
          type="button"
          className="ai-toggle"
          onClick={() => setShowAi((v) => !v)}
        >
          {showAi ? "▾" : "▸"} Configuración de IA (opcional, tu propia API key)
        </button>

        {showAi ? (
          <div className="ai-config">
            <label className="field">
              <span className="field-label">Proveedor</span>
              <select
                className="field-input"
                value={ai.provider}
                onChange={(e) => updateAi({ provider: e.target.value as AIProvider, model: "" })}
              >
                {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">API key</span>
              <input
                className="field-input"
                type="password"
                value={ai.apiKey}
                placeholder="sk-..."
                autoComplete="off"
                onChange={(e) => updateAi({ apiKey: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field-label">Modelo (opcional)</span>
              <input
                className="field-input"
                type="text"
                value={ai.model}
                placeholder={DEFAULT_MODELS[ai.provider]}
                onChange={(e) => updateAi({ model: e.target.value })}
              />
            </label>
            <p className="kw-hint">
              Tu API key se guarda solo en este navegador (localStorage) y se envía directamente al
              proveedor que elijas. No pasa por ningún servidor nuestro.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
