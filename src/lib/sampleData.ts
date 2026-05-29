import type { ResumeData } from "../types";

/** Generates a short unique id for list items. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Seed data extracted from the example CV. Acts as the default template so the
 * app is useful immediately and as a reference for the expected structure.
 */
export const sampleData: ResumeData = {
  contact: {
    fullName: "José Camacaro",
    title: "Full Stack Developer",
    location: "Barquisimeto",
    email: "camacaroj21@gmail.com",
    phone: "+58 414-5515553",
    linkedin: "jose-camacaro",
    linkedinUrl: "https://www.linkedin.com/in/jose-camacaro",
    github: "josera21",
    githubUrl: "https://github.com/josera21",
    website: "",
    websiteUrl: "",
  },
  summary:
    "Full Stack Developer with 6+ years of experience building scalable, high-performance web applications. Specialized in React, Next.js, and modern frontend architectures, with strong expertise in JavaScript, TypeScript, and rendering patterns. Skilled at integrating APIs, optimizing UI performance, and applying accessibility and testing best practices. Complemented by backend (Node.js, NestJS, Rails) and mobile (React Native) experience, providing an end-to-end perspective for product delivery.",
  experience: [
    {
      id: "exp1",
      company: "House Edge",
      role: "Senior Frontend Developer",
      startDate: "Oct 2025",
      endDate: "Present",
      location: "",
      bullets: [
        "Developed in-app purchases with booster products and monthly subscriptions for Android and iOS using Play Store and App Store.",
        "Manage claim rewards on the mobile app (React Native) and web application (Next.js).",
      ],
    },
    {
      id: "exp2",
      company: "CH Robinson",
      role: "Frontend - Full Stack Developer",
      startDate: "Jun 2022",
      endDate: "Oct 2025",
      location: "",
      bullets: [
        "Developed responsive web interfaces and unified React Native screens to improve cross-platform consistency.",
        "Built key features like Cash Advance and Financial Settings (Load Pay, Quick Pay), contributing to increased user engagement and revenue.",
        "Ported legacy native iOS/Android screens to React Native, unifying the codebase and reducing maintenance overhead.",
      ],
    },
    {
      id: "exp3",
      company: "Ohana",
      role: "Full Stack Developer",
      startDate: "Dec 2019",
      endDate: "Jun 2022",
      location: "",
      bullets: [
        "Implemented micro frontend architecture with React and NestJS, enabling modular development.",
        "Built interactive dashboards and reusable components that enhanced UX and developer velocity.",
        "Managed deployments and CI/CD pipelines using Fastlane and CircleCI.",
        "Led mobile development using React Native, implementing micro frontend architecture for modularity.",
      ],
    },
    {
      id: "exp4",
      company: "Develative",
      role: "Full Stack Developer",
      startDate: "Sep 2019",
      endDate: "Dec 2019",
      location: "",
      bullets: [
        "Developed end-to-end web apps using React and Ruby on Rails.",
        "Integrated backend services and frontend UIs for seamless user experiences.",
        "Improved app performance by optimizing backend-frontend communication.",
      ],
    },
    {
      id: "exp5",
      company: "BellBank",
      role: "Android Developer",
      startDate: "Aug 2019",
      endDate: "Oct 2019",
      location: "",
      bullets: [
        "Delivered a cross-platform mobile banking app using React Native.",
        "Optimized performance and ensured consistency across devices.",
        "Collaborated with designers and stakeholders to ship secure, user-friendly features.",
      ],
    },
    {
      id: "exp6",
      company: "Najo Consultores",
      role: "Frontend Developer",
      startDate: "May 2018",
      endDate: "Dec 2019",
      location: "",
      bullets: [
        "Built a cryptocurrency-based contactless payment system (NFC) for live deployment in a baseball stadium.",
        "Stack included React, Redux, Material UI, and ElectronJS.",
      ],
    },
  ],
  education: [
    {
      id: "edu1",
      institution: 'Universidad Centroccidental "Lisandro Alvarado"',
      degree: "BSc, Software Engineering",
      startDate: "Jan 2012",
      endDate: "Jan 2018",
      location: "",
    },
  ],
  courses: [
    { id: "c1", provider: "Platzi", name: "N8N Technical Fundamentals", startDate: "May 2025", endDate: "Jun 2025" },
    { id: "c2", provider: "Security Journey", name: "Intermediate & Foundational – Software Developer", startDate: "Apr 2025", endDate: "Apr 2025" },
    { id: "c3", provider: "Platzi", name: "Prompt Engineering with ChatGPT", startDate: "Feb 2025", endDate: "Feb 2025" },
    { id: "c4", provider: "Platzi", name: "Android Technical Fundamentals", startDate: "Apr 2023", endDate: "Apr 2023" },
    { id: "c5", provider: "Platzi", name: "React.js Render Patterns", startDate: "Jan 2022", endDate: "Jan 2022" },
    { id: "c6", provider: "HackerRank", name: "React Basic Certificate", startDate: "Feb 2022", endDate: "Feb 2022" },
    { id: "c7", provider: "Platzi", name: "JavaScript Testing with Jest", startDate: "Dec 2020", endDate: "Dec 2020" },
    { id: "c8", provider: "freeCodeCamp", name: "Front-end Developer", startDate: "Sep 2017", endDate: "Sep 2017" },
  ],
  skills: [
    { id: "s1", category: "Languages", items: "JavaScript, TypeScript, Java, Kotlin, Dart, Ruby, HTML/CSS" },
    { id: "s2", category: "Mobile", items: "React Native, Android SDK, Flutter" },
    { id: "s3", category: "Frontend", items: "React, Next.js, AngularJS" },
    { id: "s4", category: "Backend", items: "Node.js, Ruby on Rails, NestJS" },
    { id: "s5", category: "Testing & DevOps", items: "Jest, GitHub Actions, CircleCI, Docker, Fastlane" },
    { id: "s6", category: "Databases", items: "PostgreSQL, MongoDB, Firestore" },
    { id: "s7", category: "Tools", items: "Git, Jira, Azure DevOps, Postman, Sentry" },
    { id: "s8", category: "Other", items: "RESTful APIs, GraphQL, TDD, SOLID, Scrum, Kanban" },
  ],
  languages: [
    { id: "l1", language: "Spanish", level: "Native speaker" },
    { id: "l2", language: "English", level: "Highly proficient in speaking and writing" },
  ],
  settings: {
    accentColor: "#1f3a5f",
    fontSize: 10,
    showLastUpdated: true,
  },
};

/** An empty resume used when the user wants to start from scratch. */
export const emptyData: ResumeData = {
  contact: {
    fullName: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    linkedinUrl: "",
    github: "",
    githubUrl: "",
    website: "",
    websiteUrl: "",
  },
  summary: "",
  experience: [],
  education: [],
  courses: [],
  skills: [],
  languages: [],
  settings: {
    accentColor: "#1f3a5f",
    fontSize: 10,
    showLastUpdated: true,
  },
};
