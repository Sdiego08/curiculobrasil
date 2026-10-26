export type IniKey = "family" | "freela" | "volunteer" | "school" | "project" | "job";
export interface IniExp { has?: boolean; what: string; when: string; company: string; role: string }
export interface Formation { course: string; type: string; inst: string; status: string; year: string; more?: boolean }
export interface Job { role: string; company: string; start: string; end: string; current: boolean; desc: string; result: string; more?: boolean }
export interface Pub { title: string; type: string; year: string; venue: string; more?: boolean }
export interface Course { name: string; inst: string; hours: string; year: string; more?: boolean }
export interface Lang { lang: string; level: string; more?: boolean }

export interface State {
  name: string; city: string; phone: string; whatsapp: boolean; email: string; link: string;
  profile: "" | "A" | "B" | "C" | "D" | "E";
  school: string; schoolYear: string; shift: string;
  hsSchool: string; hsYear: string;
  ini: Record<IniKey, IniExp>;
  formations: Formation[];
  jobs: Job[];
  hasOther?: boolean; others: Job[];
  hasPubs?: boolean; pubs: Pub[];
  hasCourses?: boolean; courses: Course[];
  skills: string[]; skillsExtra: string;
  hasLangs?: boolean; langs: Lang[];
  target: string; pitch: string; objective: string; objectiveTouched: boolean;
  overrides: Record<string, string>;
}

const blankIni = (): IniExp => ({ what: "", when: "", company: "", role: "" });
export const blankFormation = (): Formation => ({ course: "", type: "", inst: "", status: "", year: "" });
export const blankJob = (): Job => ({ role: "", company: "", start: "", end: "", current: false, desc: "", result: "" });
export const blankPub = (): Pub => ({ title: "", type: "", year: "", venue: "" });
export const blankCourse = (): Course => ({ name: "", inst: "", hours: "", year: "" });
export const blankLang = (): Lang => ({ lang: "", level: "" });

export const initialState = (): State => ({
  name: "", city: "", phone: "", whatsapp: false, email: "", link: "", profile: "",
  school: "", schoolYear: "", shift: "", hsSchool: "", hsYear: "",
  ini: { family: blankIni(), freela: blankIni(), volunteer: blankIni(), school: blankIni(), project: blankIni(), job: blankIni() },
  formations: [], jobs: [], others: [], pubs: [], courses: [], skills: [], skillsExtra: "", langs: [],
  target: "", pitch: "", objective: "", objectiveTouched: false, overrides: {},
});

export const isIni = (s: State) => s.profile === "A" || s.profile === "B";

/* ---------- Texto de currículo ---------- */
const VERBS: [string, string, string][] = [
  ["dava aula", "Aulas", "de"], ["atendia", "Atendimento", "a"], ["atendi", "Atendimento", "a"],
  ["organizava", "Organização", "de"], ["organizei", "Organização", "de"], ["fechava", "Fechamento", "de"],
  ["entregava", "Entrega", "de"], ["vendia", "Venda", "de"], ["cuidava", "Cuidado", "de"],
  ["limpava", "Limpeza", "de"], ["controlava", "Controle", "de"], ["ensinava", "Ensino", "de"],
  ["recebia", "Recebimento", "de"], ["separava", "Separação", "de"], ["montava", "Montagem", "de"],
  ["consertava", "Conserto", "de"], ["preparava", "Preparo", "de"], ["arrumava", "Arrumação", "de"],
  ["coordenava", "Coordenação", "de"], ["elaborava", "Elaboração", "de"], ["desenvolvia", "Desenvolvimento", "de"],
  ["gerenciava", "Gestão", "de"], ["planejava", "Planejamento", "de"], ["auxiliava", "Auxílio", "a"],
  ["cadastrava", "Cadastro", "de"], ["divulgava", "Divulgação", "de"], ["produzia", "Produção", "de"],
  ["editava", "Edição", "de"], ["criava", "Criação", "de"], ["repunha", "Reposição", "de"],
  ["lavava", "Lavagem", "de"], ["registrava", "Registro", "de"], ["acompanhava", "Acompanhamento", "de"],
  ["administrava", "Administração", "de"], ["supervisionava", "Supervisão", "de"], ["fazia", "Execução", "de"],
];
const verbAlt = VERBS.map((v) => v[0].replace(" ", "\\s+")).join("|");
const cap = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);

function polishSentence(text: string): string {
  let t = text.trim().replace(/[.!?]+$/, "").replace(/^eu\s+/i, "");
  if (!t) return "";
  const pieces = t.split(new RegExp(`\\s*[,;]\\s*|\\s+e\\s+(?=(?:${verbAlt})\\b)`, "i")).filter(Boolean);
  let any = false;
  const out = pieces.map((p) => {
    const piece = p.trim().replace(/^eu\s+/i, "");
    const lower = piece.toLowerCase();
    for (const [verb, noun, prep] of VERBS) {
      const m = lower.match(new RegExp(`^${verb.replace(" ", "\\s+")}\\b\\s*`));
      if (!m) continue;
      any = true;
      let rest = piece.slice(m[0].length).replace(/^(os|as|o|a|um|uma|uns|umas)\s+/i, "");
      if (!rest) return noun;
      if (/^(de|do|da|dos|das|com|no|na|nos|nas|em|para|ao|aos|à|às)\b/i.test(rest)) return `${noun} ${rest}`;
      return `${noun} ${prep} ${rest}`;
    }
    return piece;
  });
  if (!any) return cap(t);
  const lowered = out.map((p, i) => (i === 0 ? cap(p) : p[0].toLowerCase() + p.slice(1)));
  return lowered.length > 1 ? `${lowered.slice(0, -1).join(", ")} e ${lowered.at(-1)}` : lowered[0];
}

/** Ajusta a resposta para texto de currículo, sem inventar nada. */
export function polish(text: string): string {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(polishSentence)
    .filter(Boolean)
    .join(". ");
}

/* ---------- Documento ---------- */
export interface Item { head?: string; body?: string }
export interface Section { key: string; title: string; items: Item[] }
export interface Doc { name: string; contact: string; sections: Section[] }

export const serialize = (items: Item[]) => items.map((i) => [i.head, i.body].filter(Boolean).join("\n")).join("\n\n");
export function parse(text: string): Item[] {
  return text.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((l) => l.length)
    .map((l) => (l.length > 1 ? { head: l[0], body: l.slice(1).join("\n") } : { body: l[0] }));
}

const RANK: Record<string, number> = { Doutorado: 7, Mestrado: 6, "Especialização ou MBA": 5, Bacharelado: 4, Licenciatura: 4, Tecnólogo: 3, Técnico: 2 };
export const fmtMonth = (m: string) => { const [y, mo] = m.split("-"); return y && mo ? `${mo}/${y}` : m; };
const period = (j: Job) => `${fmtMonth(j.start)} – ${j.current ? "atual" : fmtMonth(j.end)}`;
const sortJobs = (l: Job[]) => [...l].filter((j) => j.role || j.company).sort((a, b) => (a.current !== b.current ? (a.current ? -1 : 1) : (b.start || "").localeCompare(a.start || "")));
const jobItem = (j: Job): Item => {
  const body = [polish(j.desc), j.result.trim() ? `Resultado: ${polish(j.result)}` : ""].filter(Boolean).join("\n");
  return { head: `${j.role} — ${j.company} (${period(j)})`, body: body || undefined };
};
const formLine = (f: Formation) => {
  const type = f.type === "Especialização ou MBA" ? "Especialização/MBA" : f.type;
  const base = `${type} em ${f.course} — ${f.inst}`;
  if (f.status === "Concluído") return `${base}, ${f.year}`;
  if (f.status === "Cursando") return `${base}, cursando (previsão de conclusão: ${f.year})`;
  return `Cursou ${base}`;
};
const INI_LABEL: Record<IniKey, string> = {
  family: "Auxiliar no comércio da família", freela: "Trabalho autônomo", volunteer: "Trabalho voluntário",
  school: "Atividade na escola", project: "Projetos, eletivas e feiras", job: "",
};

export function buildObjective(s: State) {
  const MAP: Record<string, string> = {
    "Jovem aprendiz": "Vaga de jovem aprendiz.", "Estágio": "Vaga de estágio.",
    "Atendimento e vendas": "Vaga na área de atendimento e vendas.", "Administrativo": "Vaga na área administrativa.",
    "Área técnica": "Vaga na área técnica.", "Ainda não sei": "",
  };
  const a = isIni(s) ? MAP[s.target] ?? "" : s.target.trim() ? `${cap(s.target.trim().replace(/\.$/, ""))}.` : "";
  const p = s.pitch.trim() ? `${cap(s.pitch.trim().replace(/[.!]+$/, ""))}.` : "";
  return [a, p].filter(Boolean).join(" ");
}

export function buildDoc(s: State): Doc {
  const o = s.overrides;
  const contact = [s.city, s.phone && `${s.phone}${s.whatsapp ? " (WhatsApp)" : ""}`, s.email, s.link].filter(Boolean).join("  ·  ");
  const courses: Item[] = s.courses.filter((c) => c.name).map((c) => ({ body: [c.name, c.inst, c.hours && `${c.hours.replace(/\s*h$/i, "")}h`, c.year].filter(Boolean).join(" — ") }));
  const skills = [...s.skills, ...s.skillsExtra.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean).map(cap)];
  const skillItems: Item[] = skills.length ? [{ body: skills.join(" · ") }] : [];
  const langs: Item[] = s.langs.filter((l) => l.lang).map((l) => ({ body: `${cap(l.lang)}${l.level ? ` — ${l.level}` : ""}` }));
  const objective: Item[] = s.objective.trim() ? [{ body: s.objective.trim() }] : [];
  let sections: Section[];
  if (isIni(s)) {
    const form: Item[] = [];
    if (s.profile === "A" && s.school) form.push({ body: `Ensino Médio — ${s.school} — cursando o ${s.schoolYear} ano, turno da ${s.shift.toLowerCase()}` });
    if (s.profile === "B" && s.hsSchool) form.push({ body: `Ensino Médio completo — ${s.hsSchool}, ${s.hsYear}` });
    const exps: Item[] = [];
    (Object.keys(INI_LABEL) as IniKey[]).forEach((k) => {
      const e = s.ini[k];
      if (!e.has) return;
      if (k === "job") { if (e.company || e.role) exps.push({ body: `${cap(e.role)} — ${e.company}${e.when ? ` (${e.when})` : ""}` }); return; }
      if (!e.what.trim()) return;
      exps.push({ head: `${INI_LABEL[k]}${e.when ? ` (${e.when})` : ""}`, body: polish(e.what) });
    });
    sections = [
      { key: "objetivo", title: "Objetivo", items: objective },
      { key: "formacao", title: "Formação", items: form },
      { key: "cursos", title: "Cursos", items: courses },
      { key: "experiencias", title: "Experiências e atividades", items: exps },
      { key: "habilidades", title: "Habilidades", items: skillItems },
      { key: "idiomas", title: "Idiomas", items: langs },
    ];
  } else {
    const forms = [...s.formations].filter((f) => f.course)
      .sort((a, b) => (RANK[b.type] ?? 0) - (RANK[a.type] ?? 0) || (b.year || "").localeCompare(a.year || ""))
      .map((f) => ({ body: formLine(f) }));
    if (s.hsSchool) forms.push({ body: `Ensino Médio — ${s.hsSchool}, ${s.hsYear}` });
    sections = [
      { key: "objetivo", title: "Objetivo", items: objective },
      { key: "experiencia", title: "Experiência profissional", items: sortJobs(s.jobs).map(jobItem) },
      { key: "outras", title: "Outras experiências", items: s.hasOther ? sortJobs(s.others).map(jobItem) : [] },
      { key: "formacao", title: "Formação acadêmica", items: forms },
      { key: "producao", title: "Produção acadêmica", items: s.hasPubs ? s.pubs.filter((p) => p.title).map((p) => ({ body: [p.title, p.type, p.venue, p.year].filter(Boolean).join(" — ") })) : [] },
      { key: "cursos", title: "Cursos", items: courses },
      { key: "habilidades", title: "Habilidades", items: skillItems },
      { key: "idiomas", title: "Idiomas", items: langs },
    ];
  }
  sections = sections.map((sec) => (o[sec.key] !== undefined ? { ...sec, items: parse(o[sec.key]) } : sec)).filter((sec) => sec.items.length);
  return { name: o.name ?? s.name, contact: o.contact ?? contact, sections };
}
