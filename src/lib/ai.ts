import type { ResumeData } from "../types";

export type AIProvider = "openai" | "anthropic" | "gemini";

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  /** Optional model override; falls back to a sensible default per provider. */
  model: string;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-1.5-flash",
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI (GPT)",
  anthropic: "Anthropic (Claude)",
  gemini: "Google (Gemini)",
};

const AI_STORAGE_KEY = "cv-builder:ai";

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (raw) return { provider: "openai", apiKey: "", model: "", ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { provider: "openai", apiKey: "", model: "" };
}

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const SYSTEM_PROMPT = `You are an expert resume writer and ATS (Applicant Tracking System) optimization assistant.
You receive a candidate's resume as JSON and a job description. Return an ADAPTED version of the SAME resume JSON that better matches the job.

STRICT RULES:
- Make short, specific, truthful edits only. NEVER invent employers, job titles, dates, degrees, or technologies the candidate clearly does not have.
- You MAY: rephrase the "summary" to emphasize the most relevant strengths; rephrase and reorder experience "bullets" to surface relevant accomplishments and naturally include keywords from the job description WHERE TRUTHFUL; reorder "skills" so the most relevant come first; add a skill ONLY if it is clearly implied by existing skills or experience.
- Do NOT change the "contact" object or the "settings" object. Keep every "id" field exactly as received.
- Keep the EXACT same JSON schema and keys as the input. Do not add or remove top-level keys.
- Respond with ONLY the JSON object. No markdown, no code fences, no commentary.`;

function buildUserPrompt(data: ResumeData, jobDescription: string): string {
  const slim = { ...data };
  return `JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT RESUME JSON:\n${JSON.stringify(slim)}`;
}

function stripToJson(text: string): string {
  let t = text.trim();
  // Remove ```json ... ``` or ``` ... ``` fences if present.
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  // Fall back to the outermost braces.
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1);
  return t;
}

async function callOpenAI(s: AISettings, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${s.apiKey}`,
    },
    body: JSON.stringify({
      model: s.model || DEFAULT_MODELS.openai,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(s: AISettings, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": s.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: s.model || DEFAULT_MODELS.anthropic,
      max_tokens: 4096,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = await res.json();
  return json.content?.[0]?.text ?? "";
}

async function callGemini(s: AISettings, system: string, user: string): Promise<string> {
  const model = s.model || DEFAULT_MODELS.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    s.apiKey,
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function readError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = await res.json();
    detail = body?.error?.message || body?.error?.type || JSON.stringify(body);
  } catch {
    detail = await res.text().catch(() => "");
  }
  return `Error ${res.status}: ${detail || res.statusText}`;
}

/**
 * Calls the configured AI provider to produce a job-tailored variant of the
 * resume. Contact and settings are forced back to the originals so the model
 * can never alter them. Throws with a readable message on failure.
 */
export async function tailorResumeWithAI(
  data: ResumeData,
  jobDescription: string,
  settings: AISettings,
): Promise<ResumeData> {
  if (!settings.apiKey.trim()) throw new Error("Falta la API key.");
  const user = buildUserPrompt(data, jobDescription);

  let raw: string;
  if (settings.provider === "openai") raw = await callOpenAI(settings, SYSTEM_PROMPT, user);
  else if (settings.provider === "anthropic") raw = await callAnthropic(settings, SYSTEM_PROMPT, user);
  else raw = await callGemini(settings, SYSTEM_PROMPT, user);

  if (!raw) throw new Error("La IA no devolvió contenido.");

  let parsed: ResumeData;
  try {
    parsed = JSON.parse(stripToJson(raw)) as ResumeData;
  } catch {
    throw new Error("No se pudo interpretar la respuesta de la IA como JSON.");
  }

  // Never trust the model with contact details or visual settings.
  return {
    ...data,
    ...parsed,
    contact: data.contact,
    settings: data.settings,
  };
}
