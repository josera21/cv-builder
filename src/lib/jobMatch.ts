import type { ResumeData } from "../types";

export interface Keyword {
  /** Lowercased form used for matching */
  key: string;
  /** Display form shown in the UI */
  label: string;
}

export interface JobMatchResult {
  matched: Keyword[];
  missing: Keyword[];
  /** 0–100 score: how many job keywords already appear in the CV */
  score: number;
}

/**
 * Curated software-industry terms. Matching against a dictionary keeps the
 * keyword extraction focused and avoids flooding the user with noise words.
 * Multi-word and symbol-bearing entries (e.g. "react native", "ci/cd", "c#")
 * are matched as whole phrases.
 */
const KNOWN_SKILLS = [
  "javascript", "typescript", "java", "kotlin", "swift", "dart", "ruby", "python",
  "go", "golang", "rust", "php", "c#", "c++", "c", "scala", "elixir", "html", "css",
  "sass", "tailwind", "tailwindcss",
  "react", "react native", "next.js", "nextjs", "angular", "angularjs", "vue", "vue.js",
  "svelte", "redux", "zustand", "remix", "astro", "electron", "electronjs", "jquery",
  "node", "node.js", "nodejs", "express", "nestjs", "nest.js", "ruby on rails", "rails",
  "django", "flask", "fastapi", "spring", "spring boot", ".net", "asp.net", "laravel",
  "graphql", "rest", "restful", "rest api", "grpc", "websocket", "microservices",
  "micro frontend", "micro frontends", "serverless",
  "postgresql", "postgres", "mysql", "mongodb", "redis", "firestore", "firebase",
  "dynamodb", "sqlite", "elasticsearch", "prisma", "sequelize", "sql", "nosql",
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
  "ci/cd", "cicd", "github actions", "gitlab ci", "circleci", "jenkins", "fastlane",
  "git", "jira", "azure devops", "postman", "sentry", "datadog", "grafana",
  "jest", "vitest", "mocha", "cypress", "playwright", "testing library", "selenium",
  "tdd", "bdd", "unit testing", "integration testing", "e2e",
  "agile", "scrum", "kanban", "solid", "design patterns", "clean architecture",
  "accessibility", "a11y", "seo", "performance", "responsive", "ssr", "csr", "ssg",
  "android", "ios", "flutter", "android sdk", "react query", "tanstack query",
  "webpack", "vite", "babel", "storybook", "figma", "ui/ux", "ux", "ui",
  "openai", "llm", "prompt engineering", "machine learning", "ai", "n8n",
];

const STOPWORDS = new Set([
  "the", "and", "for", "you", "your", "our", "with", "will", "are", "have", "has",
  "this", "that", "from", "they", "their", "them", "but", "not", "all", "any", "can",
  "may", "who", "what", "when", "where", "how", "why", "out", "use", "using", "used",
  "work", "working", "team", "teams", "role", "job", "company", "experience", "years",
  "year", "skills", "ability", "able", "strong", "good", "great", "new", "must",
  "should", "would", "could", "etc", "via", "per", "into", "within", "across",
  "los", "las", "para", "con", "una", "uno", "del", "que", "por", "como", "más",
  "este", "esta", "estos", "estas", "experiencia", "trabajo", "equipo", "empresa",
  "años", "habilidades", "conocimientos", "requisitos", "responsabilidades",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-phrase, boundary-aware containment check. */
function containsPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegex(phrase)}([^a-z0-9+#]|$)`, "i");
  return pattern.test(haystack);
}

/** Builds a single normalized text blob from the resume for matching. */
export function resumeToText(data: ResumeData): string {
  const parts: string[] = [
    data.contact.title,
    data.summary,
    ...data.skills.flatMap((s) => [s.category, s.items]),
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...data.education.map((e) => `${e.degree} ${e.institution}`),
    ...data.courses.map((c) => `${c.provider} ${c.name}`),
  ];
  return normalize(parts.join(" "));
}

/** Extracts the relevant keywords from a job description. */
export function extractKeywords(jobDescription: string): Keyword[] {
  const norm = normalize(jobDescription);
  const found = new Map<string, string>();

  // 1) Known skills present as whole phrases.
  for (const skill of KNOWN_SKILLS) {
    if (containsPhrase(norm, skill)) {
      found.set(skill, skill);
    }
  }

  // 2) Capitalized / acronym tokens from the raw text (tech names we may miss).
  const capTokens = jobDescription.match(/\b[A-Z][A-Za-z0-9+#.]{2,}\b/g) ?? [];
  for (const raw of capTokens) {
    const key = raw.toLowerCase();
    if (STOPWORDS.has(key)) continue;
    if (found.has(key)) continue;
    // Skip if already covered by a known multi-word skill.
    const coveredByKnown = [...found.keys()].some((k) => k.includes(key) || key.includes(k));
    if (coveredByKnown) continue;
    found.set(key, raw);
  }

  return [...found.entries()].map(([key, label]) => ({ key, label }));
}

/** Compares a resume against a job description and returns a match report. */
export function analyzeJobMatch(data: ResumeData, jobDescription: string): JobMatchResult {
  const keywords = extractKeywords(jobDescription);
  const cvText = resumeToText(data);

  const matched: Keyword[] = [];
  const missing: Keyword[] = [];
  for (const kw of keywords) {
    if (containsPhrase(cvText, kw.key)) matched.push(kw);
    else missing.push(kw);
  }

  const total = matched.length + missing.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);
  return { matched, missing, score };
}

function reorderByMatch<T>(items: T[], matcher: (item: T) => boolean): T[] {
  const matching = items.filter(matcher);
  const rest = items.filter((i) => !matcher(i));
  return [...matching, ...rest];
}

/**
 * Produces an adapted copy of the resume WITHOUT inventing anything: it only
 * reorders existing content to surface the most job-relevant items first
 * (skills, skill categories and experience bullets). The original is untouched.
 */
export function adaptResumeLocally(data: ResumeData, jobDescription: string): ResumeData {
  const keywords = extractKeywords(jobDescription).map((k) => k.key);
  const matchesJob = (text: string) => {
    const t = normalize(text);
    return keywords.some((k) => containsPhrase(t, k) || (k.length > 3 && t.includes(k)));
  };

  const clone: ResumeData = JSON.parse(JSON.stringify(data));

  // Reorder skill items inside each category, then categories by relevance.
  clone.skills = clone.skills.map((cat) => {
    const items = cat.items.split(",").map((s) => s.trim()).filter(Boolean);
    const reordered = reorderByMatch(items, (item) => matchesJob(item));
    return { ...cat, items: reordered.join(", ") };
  });
  clone.skills = [...clone.skills].sort((a, b) => {
    const count = (cat: typeof a) =>
      cat.items.split(",").filter((i) => matchesJob(i)).length;
    return count(b) - count(a);
  });

  // Surface the most relevant accomplishment in each experience entry.
  clone.experience = clone.experience.map((exp) => ({
    ...exp,
    bullets: reorderByMatch(exp.bullets, (b) => matchesJob(b)),
  }));

  return clone;
}
