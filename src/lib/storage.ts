import type { ResumeData } from "../types";
import { sampleData } from "./sampleData";

const STORAGE_KEY = "cv-builder:resume";

/**
 * Loads the resume from localStorage. Falls back to the sample data the first
 * time the app runs or if the stored payload is corrupted. Missing fields are
 * merged with the sample defaults to stay forward-compatible.
 */
export function loadResume(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleData;
    const parsed = JSON.parse(raw) as Partial<ResumeData>;
    return {
      ...sampleData,
      ...parsed,
      contact: { ...sampleData.contact, ...parsed.contact },
      settings: { ...sampleData.settings, ...parsed.settings },
    };
  } catch {
    return sampleData;
  }
}

export function saveResume(data: ResumeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage might be full or disabled; ignore so the UI keeps working.
  }
}

export function clearResume(): void {
  localStorage.removeItem(STORAGE_KEY);
}
