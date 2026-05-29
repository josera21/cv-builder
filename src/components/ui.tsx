import type { ReactNode } from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export function TextInput({ label, value, onChange, placeholder, type = "text" }: TextInputProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ label, value, onChange, placeholder, rows = 4 }: TextAreaProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea
        className="field-input"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface CardProps {
  children: ReactNode;
  onRemove?: () => void;
  title?: string;
}

export function Card({ children, onRemove, title }: CardProps) {
  return (
    <div className="card">
      {(title || onRemove) && (
        <div className="card-head">
          {title ? <span className="card-title">{title}</span> : <span />}
          {onRemove && (
            <button type="button" className="btn-icon" onClick={onRemove} title="Eliminar">
              ✕
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Section({ title, children, defaultOpen = false }: SectionProps) {
  return (
    <details className="section-block" open={defaultOpen}>
      <summary className="section-summary">{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn-add" onClick={onClick}>
      + {label}
    </button>
  );
}
