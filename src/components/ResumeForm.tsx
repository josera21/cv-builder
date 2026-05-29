import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  CourseItem,
  SkillCategory,
  LanguageItem,
} from "../types";
import { uid } from "../lib/sampleData";
import { TextInput, TextArea, Card, Section, AddButton } from "./ui";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: Props) {
  const update = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });
  const updateContact = (patch: Partial<ResumeData["contact"]>) =>
    update({ contact: { ...data.contact, ...patch } });
  const updateSettings = (patch: Partial<ResumeData["settings"]>) =>
    update({ settings: { ...data.settings, ...patch } });

  // --- Experience helpers ---
  const setExperience = (items: ExperienceItem[]) => update({ experience: items });
  const patchExperience = (id: string, patch: Partial<ExperienceItem>) =>
    setExperience(data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // --- Education helpers ---
  const setEducation = (items: EducationItem[]) => update({ education: items });
  const patchEducation = (id: string, patch: Partial<EducationItem>) =>
    setEducation(data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // --- Course helpers ---
  const setCourses = (items: CourseItem[]) => update({ courses: items });
  const patchCourse = (id: string, patch: Partial<CourseItem>) =>
    setCourses(data.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  // --- Skill helpers ---
  const setSkills = (items: SkillCategory[]) => update({ skills: items });
  const patchSkill = (id: string, patch: Partial<SkillCategory>) =>
    setSkills(data.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // --- Language helpers ---
  const setLanguages = (items: LanguageItem[]) => update({ languages: items });
  const patchLanguage = (id: string, patch: Partial<LanguageItem>) =>
    setLanguages(data.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="form">
      <Section title="Contacto" defaultOpen>
        <TextInput label="Nombre completo" value={data.contact.fullName} onChange={(v) => updateContact({ fullName: v })} placeholder="José Camacaro" />
        <TextInput label="Título profesional" value={data.contact.title} onChange={(v) => updateContact({ title: v })} placeholder="Full Stack Developer" />
        <div className="grid-2">
          <TextInput label="Ubicación" value={data.contact.location} onChange={(v) => updateContact({ location: v })} placeholder="Barquisimeto" />
          <TextInput label="Teléfono" value={data.contact.phone} onChange={(v) => updateContact({ phone: v })} placeholder="+58 414-5515553" />
        </div>
        <TextInput label="Email" type="email" value={data.contact.email} onChange={(v) => updateContact({ email: v })} placeholder="tucorreo@gmail.com" />
        <div className="grid-2">
          <TextInput label="LinkedIn (texto)" value={data.contact.linkedin} onChange={(v) => updateContact({ linkedin: v })} placeholder="jose-camacaro" />
          <TextInput label="LinkedIn (URL)" value={data.contact.linkedinUrl} onChange={(v) => updateContact({ linkedinUrl: v })} placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="grid-2">
          <TextInput label="GitHub (texto)" value={data.contact.github} onChange={(v) => updateContact({ github: v })} placeholder="josera21" />
          <TextInput label="GitHub (URL)" value={data.contact.githubUrl} onChange={(v) => updateContact({ githubUrl: v })} placeholder="https://github.com/..." />
        </div>
        <div className="grid-2">
          <TextInput label="Web/Portfolio (texto)" value={data.contact.website} onChange={(v) => updateContact({ website: v })} placeholder="miweb.com" />
          <TextInput label="Web/Portfolio (URL)" value={data.contact.websiteUrl} onChange={(v) => updateContact({ websiteUrl: v })} placeholder="https://miweb.com" />
        </div>
      </Section>

      <Section title="Resumen profesional" defaultOpen>
        <TextArea
          label="Resumen"
          value={data.summary}
          onChange={(v) => update({ summary: v })}
          rows={6}
          placeholder="2-4 frases resaltando tu experiencia, especialidades y stack principal."
        />
      </Section>

      <Section title={`Experiencia (${data.experience.length})`} defaultOpen>
        {data.experience.map((exp) => (
          <Card key={exp.id} onRemove={() => setExperience(data.experience.filter((e) => e.id !== exp.id))} title={exp.company || "Nueva experiencia"}>
            <div className="grid-2">
              <TextInput label="Empresa" value={exp.company} onChange={(v) => patchExperience(exp.id, { company: v })} />
              <TextInput label="Rol" value={exp.role} onChange={(v) => patchExperience(exp.id, { role: v })} />
            </div>
            <div className="grid-2">
              <TextInput label="Inicio" value={exp.startDate} onChange={(v) => patchExperience(exp.id, { startDate: v })} placeholder="Oct 2025" />
              <TextInput label="Fin" value={exp.endDate} onChange={(v) => patchExperience(exp.id, { endDate: v })} placeholder="Present" />
            </div>
            <TextInput label="Ubicación" value={exp.location} onChange={(v) => patchExperience(exp.id, { location: v })} placeholder="Remote" />
            <TextArea
              label="Logros (una línea por bullet)"
              value={exp.bullets.join("\n")}
              onChange={(v) => patchExperience(exp.id, { bullets: v.split("\n") })}
              rows={Math.max(3, exp.bullets.length + 1)}
              placeholder={"Desarrollé X que mejoró Y en Z%\nLideré el equipo de..."}
            />
          </Card>
        ))}
        <AddButton
          label="Agregar experiencia"
          onClick={() =>
            setExperience([
              ...data.experience,
              { id: uid(), company: "", role: "", startDate: "", endDate: "", location: "", bullets: [""] },
            ])
          }
        />
      </Section>

      <Section title={`Educación (${data.education.length})`}>
        {data.education.map((edu) => (
          <Card key={edu.id} onRemove={() => setEducation(data.education.filter((e) => e.id !== edu.id))} title={edu.institution || "Nueva formación"}>
            <TextInput label="Institución" value={edu.institution} onChange={(v) => patchEducation(edu.id, { institution: v })} />
            <TextInput label="Título / Grado" value={edu.degree} onChange={(v) => patchEducation(edu.id, { degree: v })} placeholder="BSc, Software Engineering" />
            <div className="grid-2">
              <TextInput label="Inicio" value={edu.startDate} onChange={(v) => patchEducation(edu.id, { startDate: v })} placeholder="Jan 2012" />
              <TextInput label="Fin" value={edu.endDate} onChange={(v) => patchEducation(edu.id, { endDate: v })} placeholder="Jan 2018" />
            </div>
            <TextInput label="Ubicación" value={edu.location} onChange={(v) => patchEducation(edu.id, { location: v })} />
          </Card>
        ))}
        <AddButton
          label="Agregar educación"
          onClick={() =>
            setEducation([
              ...data.education,
              { id: uid(), institution: "", degree: "", startDate: "", endDate: "", location: "" },
            ])
          }
        />
      </Section>

      <Section title={`Cursos y certificaciones (${data.courses.length})`}>
        {data.courses.map((course) => (
          <Card key={course.id} onRemove={() => setCourses(data.courses.filter((c) => c.id !== course.id))} title={course.name || "Nuevo curso"}>
            <div className="grid-2">
              <TextInput label="Proveedor" value={course.provider} onChange={(v) => patchCourse(course.id, { provider: v })} placeholder="Platzi" />
              <TextInput label="Nombre" value={course.name} onChange={(v) => patchCourse(course.id, { name: v })} />
            </div>
            <div className="grid-2">
              <TextInput label="Inicio" value={course.startDate} onChange={(v) => patchCourse(course.id, { startDate: v })} placeholder="Feb 2025" />
              <TextInput label="Fin" value={course.endDate} onChange={(v) => patchCourse(course.id, { endDate: v })} placeholder="Feb 2025" />
            </div>
          </Card>
        ))}
        <AddButton
          label="Agregar curso"
          onClick={() =>
            setCourses([...data.courses, { id: uid(), provider: "", name: "", startDate: "", endDate: "" }])
          }
        />
      </Section>

      <Section title={`Habilidades (${data.skills.length})`}>
        {data.skills.map((skill) => (
          <Card key={skill.id} onRemove={() => setSkills(data.skills.filter((s) => s.id !== skill.id))} title={skill.category || "Nueva categoría"}>
            <TextInput label="Categoría" value={skill.category} onChange={(v) => patchSkill(skill.id, { category: v })} placeholder="Frontend" />
            <TextInput label="Habilidades (separadas por coma)" value={skill.items} onChange={(v) => patchSkill(skill.id, { items: v })} placeholder="React, Next.js, AngularJS" />
          </Card>
        ))}
        <AddButton
          label="Agregar categoría"
          onClick={() => setSkills([...data.skills, { id: uid(), category: "", items: "" }])}
        />
      </Section>

      <Section title={`Idiomas (${data.languages.length})`}>
        {data.languages.map((lang) => (
          <Card key={lang.id} onRemove={() => setLanguages(data.languages.filter((l) => l.id !== lang.id))} title={lang.language || "Nuevo idioma"}>
            <div className="grid-2">
              <TextInput label="Idioma" value={lang.language} onChange={(v) => patchLanguage(lang.id, { language: v })} placeholder="English" />
              <TextInput label="Nivel" value={lang.level} onChange={(v) => patchLanguage(lang.id, { level: v })} placeholder="Highly proficient" />
            </div>
          </Card>
        ))}
        <AddButton
          label="Agregar idioma"
          onClick={() => setLanguages([...data.languages, { id: uid(), language: "", level: "" }])}
        />
      </Section>

      <Section title="Apariencia">
        <div className="grid-2">
          <label className="field">
            <span className="field-label">Color de acento</span>
            <input
              className="field-color"
              type="color"
              value={data.settings.accentColor}
              onChange={(e) => updateSettings({ accentColor: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Tamaño de fuente: {data.settings.fontSize}pt</span>
            <input
              type="range"
              min={9}
              max={12}
              step={0.5}
              value={data.settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="field-check">
          <input
            type="checkbox"
            checked={data.settings.showLastUpdated}
            onChange={(e) => updateSettings({ showLastUpdated: e.target.checked })}
          />
          <span>Mostrar fecha de "Last updated"</span>
        </label>
      </Section>
    </div>
  );
}
