export interface ContactInfo {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  /** Display label for LinkedIn, e.g. "jose-camacaro" */
  linkedin: string;
  /** Full LinkedIn URL used for the embedded link */
  linkedinUrl: string;
  /** Display label for GitHub, e.g. "josera21" */
  github: string;
  /** Full GitHub URL used for the embedded link */
  githubUrl: string;
  /** Optional personal website / portfolio label */
  website: string;
  websiteUrl: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  /** Each bullet describes an accomplishment */
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface CourseItem {
  id: string;
  provider: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  id: string;
  /** e.g. "Languages", "Frontend" */
  category: string;
  /** comma-separated list of skills as a single string for simple editing */
  items: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  level: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  courses: CourseItem[];
  skills: SkillCategory[];
  languages: LanguageItem[];
  settings: ResumeSettings;
}

export interface ResumeSettings {
  /** Accent color used for section titles and the name */
  accentColor: string;
  /** Base font size in points */
  fontSize: number;
  /** Whether to show the "Last updated" line at the top */
  showLastUpdated: boolean;
}
