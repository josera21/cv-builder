import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Font,
  Svg,
  Path,
} from "@react-pdf/renderer";
import type { ResumeData } from "../types";

/**
 * Small, monochrome vector icons for the contact line. Rendered as inline SVG
 * (no external assets / network) so they stay crisp at any zoom. Icons are
 * purely decorative; the real selectable text label is always shown next to
 * them so ATS parsers still read the contact details.
 */
type ContactIcon = "linkedin" | "github";

const ICON_PATHS: Record<ContactIcon, string> = {
  // LinkedIn glyph
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  // GitHub mark
  github:
    "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z",
};

function ContactGlyph({ icon, color, size }: { icon: ContactIcon; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
      <Path d={ICON_PATHS[icon]} fill={color} />
    </Svg>
  );
}

/**
 * ATS notes:
 * - Single column, standard section headings, real selectable text.
 * - Uses Helvetica (a core PDF font) so text extracts cleanly everywhere.
 * - No images, columns, tables or text boxes that confuse parsers.
 * - Links carry plain-text labels so they remain readable when stripped.
 */

Font.registerHyphenationCallback((word) => [word]);

const buildStyles = (accent: string, fontSize: number) =>
  StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 42,
      fontFamily: "Helvetica",
      fontSize,
      color: "#1a1a1a",
      lineHeight: 1.4,
    },
    lastUpdated: {
      fontSize: fontSize - 2,
      color: "#777",
      textAlign: "right",
      marginBottom: 2,
    },
    name: {
      fontSize: fontSize + 12,
      fontFamily: "Helvetica-Bold",
      color: accent,
      letterSpacing: 0.3,
      lineHeight: 1.15,
      marginBottom: 2,
    },
    title: {
      fontSize: fontSize + 1,
      color: "#444",
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 5,
      color: "#333",
    },
    contactItem: { marginRight: 4 },
    contactSep: { marginRight: 4, color: "#aaa" },
    link: { color: accent, textDecoration: "none" },
    section: { marginTop: 12 },
    sectionTitle: {
      fontSize: fontSize + 1,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      borderBottomWidth: 1,
      borderBottomColor: accent,
      paddingBottom: 2,
      marginBottom: 5,
    },
    summary: { textAlign: "justify" },
    entry: { marginBottom: 7 },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    entryLeft: { flex: 1, paddingRight: 8 },
    entryTitle: { fontFamily: "Helvetica-Bold" },
    entryRole: { color: "#333" },
    entryDates: {
      fontFamily: "Helvetica-Oblique",
      color: "#555",
      fontSize: fontSize - 0.5,
      textAlign: "right",
    },
    bullets: { marginTop: 2 },
    bulletRow: { flexDirection: "row", marginBottom: 1.5 },
    bulletDot: { width: 10, textAlign: "center" },
    bulletText: { flex: 1, textAlign: "justify" },
    skillRow: { flexDirection: "row", marginBottom: 2 },
    skillCategory: { fontFamily: "Helvetica-Bold" },
  });

interface DatedHeaderProps {
  title: string;
  subtitle?: string;
  dates: string;
  styles: ReturnType<typeof buildStyles>;
}

function DatedHeader({ title, subtitle, dates, styles }: DatedHeaderProps) {
  return (
    <View style={styles.entryHeader}>
      <View style={styles.entryLeft}>
        <Text>
          <Text style={styles.entryTitle}>{title}</Text>
          {subtitle ? <Text style={styles.entryRole}>{`, ${subtitle}`}</Text> : null}
        </Text>
      </View>
      {dates ? <Text style={styles.entryDates}>{dates}</Text> : null}
    </View>
  );
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  const { contact, settings } = data;
  const styles = buildStyles(settings.accentColor, settings.fontSize);

  const contactParts: Array<{ label: string; url?: string; icon?: ContactIcon }> = [];
  if (contact.location) contactParts.push({ label: contact.location });
  if (contact.email) contactParts.push({ label: contact.email, url: `mailto:${contact.email}` });
  if (contact.phone) contactParts.push({ label: contact.phone });
  if (contact.linkedin)
    contactParts.push({
      label: contact.linkedin,
      url: contact.linkedinUrl || undefined,
      icon: "linkedin",
    });
  if (contact.github)
    contactParts.push({
      label: contact.github,
      url: contact.githubUrl || undefined,
      icon: "github",
    });
  if (contact.website)
    contactParts.push({ label: contact.website, url: contact.websiteUrl || undefined });

  return (
    <Document
      title={`${contact.fullName || "Resume"} - CV`}
      author={contact.fullName}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={styles.page}>
        {settings.showLastUpdated ? (
          <Text style={styles.lastUpdated}>
            {`Last updated in ${new Date().toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}`}
          </Text>
        ) : null}

        <Text style={styles.name}>{contact.fullName}</Text>
        {contact.title ? <Text style={styles.title}>{contact.title}</Text> : null}

        <View style={styles.contactRow}>
          {contactParts.map((part, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              {i > 0 ? <Text style={styles.contactSep}>•</Text> : null}
              {part.icon ? (
                <ContactGlyph
                  icon={part.icon}
                  color={settings.accentColor}
                  size={settings.fontSize}
                />
              ) : null}
              {part.url ? (
                <Link src={part.url} style={[styles.contactItem, styles.link]}>
                  {part.label}
                </Link>
              ) : (
                <Text style={styles.contactItem}>{part.label}</Text>
              )}
            </View>
          ))}
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.entry} wrap={false}>
                <DatedHeader
                  title={exp.company}
                  subtitle={exp.role}
                  dates={[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                  styles={styles}
                />
                {exp.location ? <Text style={styles.entryRole}>{exp.location}</Text> : null}
                <View style={styles.bullets}>
                  {exp.bullets
                    .filter((b) => b.trim())
                    .map((bullet, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.entry} wrap={false}>
                <DatedHeader
                  title={edu.institution}
                  subtitle={edu.degree}
                  dates={[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                  styles={styles}
                />
                {edu.location ? <Text style={styles.entryRole}>{edu.location}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.courses.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Courses & Certifications</Text>
            {data.courses.map((course) => (
              <View key={course.id} style={[styles.entry, { marginBottom: 3 }]} wrap={false}>
                <DatedHeader
                  title={course.provider}
                  subtitle={course.name}
                  dates={[course.startDate, course.endDate].filter(Boolean).join(" – ")}
                  styles={styles}
                />
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {data.skills.map((skill) => (
              <View key={skill.id} style={styles.skillRow}>
                <Text>
                  <Text style={styles.skillCategory}>{`${skill.category}: `}</Text>
                  <Text>{skill.items}</Text>
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {data.languages.map((lang) => (
              <View key={lang.id} style={styles.skillRow}>
                <Text>
                  <Text style={styles.skillCategory}>{`${lang.language}: `}</Text>
                  <Text>{lang.level}</Text>
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
