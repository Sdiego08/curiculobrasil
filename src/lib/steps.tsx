import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  type State, type IniKey, type Job, isIni, buildObjective,
  blankFormation, blankJob, blankPub, blankCourse, blankLang,
} from "./resume";

export type Draft = (d: State) => void;
export interface Ctx { s: State; mut: (fn: Draft) => void; go: (fn?: Draft) => void; load: () => void }
export interface Step {
  id: string;
  title: ReactNode;
  hint?: ReactNode;
  optional?: boolean;
  info?: boolean;
  review?: boolean;
  better?: boolean;
  button?: string;
  valid?: (s: State) => boolean;
  body?: (c: Ctx) => ReactNode;
  onSkip?: Draft;
  onNext?: Draft;
}

/* ---------- Campos ---------- */
export function Field({ label, value, onChange, type = "text", placeholder, area, autoFocus, inputMode, note }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  area?: boolean; autoFocus?: boolean; inputMode?: "numeric" | "tel" | "email" | "url" | "text"; note?: string;
}) {
  const cls = "w-full rounded-xl border border-input bg-card px-4 py-3.5 text-lg text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15";
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      {area ? (
        <textarea rows={4} className={cn(cls, "resize-none")} value={value} placeholder={placeholder} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} type={type} value={value} placeholder={placeholder} autoFocus={autoFocus} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
      )}
      {note && <span className="block text-sm text-muted-foreground">{note}</span>}
    </label>
  );
}

export function Options<T extends string | boolean>({ options, value, onPick, compact }: {
  options: { label: string; value: T }[]; value: T | undefined | ""; onPick: (v: T) => void; compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-2.5", compact ? "grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((o) => (
        <button
          type="button" key={String(o.value)} onClick={() => onPick(o.value)}
          className={cn(
            "rounded-xl border px-4 text-left font-medium transition active:scale-[0.98]",
            compact ? "py-2.5 text-center text-base" : "py-4 text-lg",
            value === o.value ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-input bg-card text-foreground hover:border-primary/60",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-base text-foreground">
      <input type="checkbox" className="size-5 accent-[var(--primary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ---------- Fábricas ---------- */
type TextOpts = Partial<Step> & { type?: string; placeholder?: string; area?: boolean; inputMode?: "numeric" | "tel" | "email" | "url" | "text"; note?: string };
const text = (id: string, title: ReactNode, get: (s: State) => string, set: (d: State, v: string) => void, o: TextOpts = {}): Step => ({
  id, title, ...o,
  valid: o.optional ? undefined : (s) => get(s).trim().length > 0 && (o.type !== "email" || /\S+@\S+\.\S+/.test(get(s))),
  onSkip: (d) => set(d, ""),
  body: ({ s, mut }) => (
    <Field autoFocus type={o.type} area={o.area} placeholder={o.placeholder} inputMode={o.inputMode} note={o.note} value={get(s)} onChange={(v) => mut((d) => set(d, v))} />
  ),
});

const choice = (id: string, title: ReactNode, options: string[], get: (s: State) => string, set: (d: State, v: string) => void, o: Partial<Step> = {}): Step => ({
  id, title, ...o,
  valid: (s) => !!get(s),
  body: ({ s, go }) => <Options options={options.map((x) => ({ label: x, value: x }))} value={get(s)} onPick={(v) => go((d) => set(d, v))} />,
});

const yn = (id: string, title: ReactNode, get: (s: State) => boolean | undefined, set: (d: State, v: boolean) => void, o: Partial<Step> = {}): Step => ({
  id, title, ...o,
  valid: (s) => get(s) !== undefined,
  body: ({ s, go }) => <Options options={[{ label: "Sim", value: true }, { label: "Não", value: false }]} value={get(s)} onPick={(v) => go((d) => set(d, v))} />,
});

function more<T extends { more?: boolean }>(id: string, title: string, list: (d: State) => T[], i: number, blank: () => T): Step {
  return yn(id, title, (s) => list(s)[i]?.more, (d, v) => {
    const L = list(d);
    L[i].more = v;
    if (v && L.length === i + 1) L.push(blank());
    if (!v) L.splice(i + 1);
  });
}

const setList = <T,>(d: State, key: "others" | "pubs" | "courses" | "langs", v: boolean, blank: () => T) => {
  if (v && (d[key] as unknown[]).length === 0) (d[key] as unknown[]).push(blank());
  if (!v) (d[key] as unknown[]) = [];
};

/* ---------- Experiência (formado) ---------- */
function jobSteps(prefix: string, list: (d: State) => Job[], i: number, firstOptional: boolean, moreTitle: string): Step[] {
  const j = (s: State) => list(s)[i];
  return [
    text(`${prefix}${i}-role`, i === 0 ? "Qual era o cargo ou função?" : "Qual era o cargo ou função nessa outra experiência?", (s) => j(s).role, (d, v) => { j(d).role = v; },
      firstOptional && i === 0 ? { optional: true, onSkip: (d) => { list(d).length = 0; } } : {}),
    text(`${prefix}${i}-company`, "Em que empresa ou instituição?", (s) => j(s).company, (d, v) => { j(d).company = v; }),
    {
      id: `${prefix}${i}-period`, title: "De quando até quando?",
      valid: (s) => !!j(s).start && (j(s).current || !!j(s).end),
      body: ({ s, mut }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início" type="month" value={j(s).start} onChange={(v) => mut((d) => { j(d).start = v; })} />
            {!j(s).current && <Field label="Fim" type="month" value={j(s).end} onChange={(v) => mut((d) => { j(d).end = v; })} />}
          </div>
          <Check label="Trabalho aqui até hoje" checked={j(s).current} onChange={(v) => mut((d) => { j(d).current = v; })} />
        </div>
      ),
    },
    text(`${prefix}${i}-desc`, "O que você fazia nesse trabalho?", (s) => j(s).desc, (d, v) => { j(d).desc = v; }, { area: true, better: true, placeholder: "Ex.: atendia clientes, organizava a agenda, fazia relatórios..." }),
    text(`${prefix}${i}-result`, "Teve algum resultado concreto que você pode citar?", (s) => j(s).result, (d, v) => { j(d).result = v; },
      { optional: true, area: true, hint: "Número, melhoria, projeto entregue. Se não tiver, pule." }),
    more(`${prefix}${i}-more`, moreTitle, list, i, blankJob),
  ];
}

/* ---------- Iniciante ---------- */
const CATS: { key: IniKey; q: string; detail: string; ex?: string; noWhen?: boolean }[] = [
  { key: "family", q: "Você já ajudou em algum negócio da família? Mercadinho, lanchonete, oficina, salão, obra, qualquer coisa.", detail: "O que você fazia lá?", ex: "Exemplos: atendia clientes, organizava estoque, fechava caixa, entregava pedidos." },
  { key: "freela", q: "Você já ganhou dinheiro por conta própria? Freela, venda, delivery, unha, cabelo, bolo, conserto, design.", detail: "O que você fazia?" },
  { key: "volunteer", q: "Já foi voluntário em alguma coisa? Igreja, ONG, time, campanha, festa do bairro.", detail: "O que você fazia?" },
  { key: "school", q: "Já teve alguma função na escola? Representante de turma, grêmio, monitoria, organizar evento.", detail: "Qual função e o que você fazia?", noWhen: true },
  { key: "project", q: "Participou de alguma eletiva, projeto ou feira que te orgulha?", detail: "Qual foi e o que você fez nela?", noWhen: true },
  { key: "job", q: "Já trabalhou registrado ou como aprendiz?", detail: "Onde, em qual função e quando?" },
];

const SKILLS = ["Word", "Excel", "PowerPoint", "Google Docs e Planilhas", "Canva", "Edição de vídeo", "Redes sociais", "Caixa e pagamentos", "Atendimento ao cliente", "Estoque", "Sistemas de gestão (ERP)", "Informática básica"];
const LEVELS = ["Básico", "Intermediário", "Avançado", "Fluente"];

export function buildSteps(s: State): Step[] {
  const st: Step[] = [
    {
      id: "welcome", info: true, button: "Começar",
      title: "Vamos montar o seu currículo.",
      hint: "Uma pergunta de cada vez. Leva uns 10 minutos e, no fim, você baixa em PDF.",
      body: ({ load }) => (
        <button type="button" onClick={load} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Já começou antes? Carregar rascunho
          <span className="mt-1 block font-normal text-muted-foreground">O rascunho fica com você, no seu celular ou computador.</span>
        </button>
      ),
    },
    text("name", "Vamos começar. Qual é o seu nome completo?", (s) => s.name, (d, v) => { d.name = v; }, { hint: "Nome completo, como está no documento." }),
    text("city", "Em que cidade você mora?", (s) => s.city, (d, v) => { d.city = v; }, { placeholder: "Ex.: Recife – PE", hint: "Cidade e estado." }),
    {
      id: "phone", title: "Qual telefone deve ser usado para entrar em contato?",
      valid: (s) => s.phone.replace(/\D/g, "").length >= 8,
      body: ({ s, mut }) => (
        <div className="space-y-4">
          <Field autoFocus type="tel" inputMode="tel" placeholder="(11) 91234-5678" value={s.phone} onChange={(v) => mut((d) => { d.phone = v; })} />
          <Check label="É WhatsApp" checked={s.whatsapp} onChange={(v) => mut((d) => { d.whatsapp = v; })} />
        </div>
      ),
    },
    text("email", "Qual é o seu e-mail?", (s) => s.email, (d, v) => { d.email = v.trim(); }, {
      type: "email", inputMode: "email",
      hint: "Use um e-mail com o seu nome. Se o seu for tipo 'gatinha2008@', vale criar um novo — leva dois minutos e evita porta fechada.",
    }),
    text("link", "Você tem LinkedIn ou portfólio online?", (s) => s.link, (d, v) => { d.link = v.trim(); }, { optional: true, type: "url", inputMode: "url", placeholder: "linkedin.com/in/seunome" }),
    {
      ...choice("profile", "Qual é a sua formação mais alta até agora?", [], () => "", () => {}),
      valid: (s) => !!s.profile,
      body: ({ s, go }) => (
        <Options
          options={[
            { label: "Ensino médio — cursando", value: "A" }, { label: "Ensino médio — concluído", value: "B" },
            { label: "Curso técnico — cursando ou concluído", value: "C" }, { label: "Graduação — cursando ou concluída", value: "D" },
            { label: "Pós-graduação, mestrado ou doutorado", value: "E" },
          ]}
          value={s.profile}
          onPick={(v) => go((d) => {
            d.profile = v as State["profile"];
            if (!isIni(d) && d.formations.length === 0) d.formations.push(blankFormation());
            if (!isIni(d) && d.jobs.length === 0) d.jobs.push(blankJob());
          })}
        />
      ),
    },
  ];
  if (!s.profile) return st;

  if (isIni(s)) {
    if (s.profile === "A") {
      st.push({
        id: "i-school", title: "Em que escola você estuda e em que ano está?",
        valid: (s) => !!s.school.trim() && !!s.schoolYear && !!s.shift,
        body: ({ s, mut }) => (
          <div className="space-y-5">
            <Field autoFocus label="Escola" value={s.school} onChange={(v) => mut((d) => { d.school = v; })} />
            <div className="space-y-1.5"><span className="text-sm font-medium text-muted-foreground">Ano</span>
              <Options compact options={["1º", "2º", "3º"].map((x) => ({ label: x, value: x }))} value={s.schoolYear} onPick={(v) => mut((d) => { d.schoolYear = v; })} /></div>
            <div className="space-y-1.5"><span className="text-sm font-medium text-muted-foreground">Turno</span>
              <Options compact options={["Manhã", "Tarde", "Noite"].map((x) => ({ label: x, value: x }))} value={s.shift} onPick={(v) => mut((d) => { d.shift = v; })} /></div>
          </div>
        ),
      });
    } else {
      st.push(hsStep("i-hs", "Em que escola você concluiu o ensino médio e em que ano?"));
    }
    st.push({ id: "ini-intro", info: true, button: "Beleza, vamos lá", title: "Agora a parte que todo mundo acha que não tem: experiência.", hint: "Vamos por partes — você provavelmente tem mais do que imagina." });
    for (const c of CATS) {
      st.push(yn(`ini-${c.key}`, c.q, (s) => s.ini[c.key].has, (d, v) => { d.ini[c.key].has = v; }));
      if (!s.ini[c.key].has) continue;
      if (c.key === "job") {
        st.push({
          id: "ini-job-d", title: c.detail,
          valid: (s) => !!s.ini.job.company.trim() && !!s.ini.job.role.trim(),
          body: ({ s, mut }) => (
            <div className="space-y-4">
              <Field autoFocus label="Empresa" value={s.ini.job.company} onChange={(v) => mut((d) => { d.ini.job.company = v; })} />
              <Field label="Função" placeholder="Ex.: Jovem aprendiz administrativo" value={s.ini.job.role} onChange={(v) => mut((d) => { d.ini.job.role = v; })} />
              <Field label="Período" placeholder="Ex.: 2024-2025" value={s.ini.job.when} onChange={(v) => mut((d) => { d.ini.job.when = v; })} />
            </div>
          ),
        });
      } else {
        st.push({
          id: `ini-${c.key}-d`, title: c.detail, better: true,
          valid: (s) => !!s.ini[c.key].what.trim(),
          body: ({ s, mut }) => (
            <div className="space-y-4">
              <Field autoFocus area note={c.ex} value={s.ini[c.key].what} onChange={(v) => mut((d) => { d.ini[c.key].what = v; })} />
              {!c.noWhen && <Field label="Quando foi?" placeholder="Ex.: 2024-2025, ou aos sábados em 2025" value={s.ini[c.key].when} onChange={(v) => mut((d) => { d.ini[c.key].when = v; })} />}
            </div>
          ),
        });
      }
    }
    if (CATS.every((c) => s.ini[c.key].has === false)) {
      st.push({ id: "ini-none", info: true, button: "Vamos lá", title: "Tudo bem.", hint: "Seu currículo vai se apoiar nos seus cursos e nas suas habilidades — e isso é completamente normal para quem está começando." });
    }
  } else {
    s.formations.forEach((_, i) => {
      const f = (s: State) => s.formations[i];
      const p = `f${i}`;
      st.push(
        text(`${p}-course`, i === 0 ? "Qual é o nome do curso?" : "Qual é o nome do outro curso?", (s) => f(s).course, (d, v) => { f(d).course = v; }, { placeholder: "Ex.: Enfermagem, Administração, Pedagogia" }),
        choice(`${p}-type`, "Qual é o tipo?", ["Técnico", "Tecnólogo", "Bacharelado", "Licenciatura", "Especialização ou MBA", "Mestrado", "Doutorado"], (s) => f(s).type, (d, v) => { f(d).type = v; }),
        text(`${p}-inst`, "Em que instituição?", (s) => f(s).inst, (d, v) => { f(d).inst = v; }),
        choice(`${p}-status`, "Qual é a situação?", ["Concluído", "Cursando", "Trancado ou interrompido"], (s) => f(s).status, (d, v) => { f(d).status = v; }),
      );
      if (f(s).status === "Concluído") st.push(text(`${p}-year`, "Em que ano você concluiu?", (s) => f(s).year, (d, v) => { f(d).year = v; }, { inputMode: "numeric", placeholder: "Ex.: 2019" }));
      if (f(s).status === "Cursando") st.push(text(`${p}-forecast`, "Qual a previsão de conclusão?", (s) => f(s).year, (d, v) => { f(d).year = v; }, { inputMode: "numeric", placeholder: "Ex.: 2027" }));
      st.push(more(`${p}-more`, "Quer adicionar outra formação?", (d) => d.formations, i, blankFormation));
    });
    st.push(hsStep("f-hs", "E o ensino médio: em que escola e em que ano você concluiu?"));
    st.push({ id: "f-intro", info: true, button: "Continuar", title: "Agora a sua experiência profissional." });
    s.jobs.forEach((_, i) => st.push(...jobSteps("j", (d) => d.jobs, i, true, "Quer adicionar outra experiência?")));
    st.push(yn("f-other", "Você tem experiência que não foi emprego formal? Estágio, voluntariado, projeto, pesquisa, iniciação científica, trabalho autônomo.",
      (s) => s.hasOther, (d, v) => { d.hasOther = v; setList(d, "others", v, blankJob); }));
    if (s.hasOther) s.others.forEach((_, i) => st.push(...jobSteps("o", (d) => d.others, i, false, "Quer adicionar mais uma experiência desse tipo?")));
    if (s.profile === "D" || s.profile === "E") {
      st.push(yn("f-pubs", "Você tem produção acadêmica relevante? Artigos, publicações, apresentação em congresso, TCC ou dissertação que valha citar.",
        (s) => s.hasPubs, (d, v) => { d.hasPubs = v; setList(d, "pubs", v, blankPub); }));
      if (s.hasPubs) s.pubs.forEach((_, i) => {
        st.push({
          id: `p${i}`, title: i === 0 ? "Conta qual foi." : "Qual é a outra?",
          valid: (s) => !!s.pubs[i].title.trim(),
          body: ({ s, mut }) => (
            <div className="space-y-4">
              <Field autoFocus label="Título" value={s.pubs[i].title} onChange={(v) => mut((d) => { d.pubs[i].title = v; })} />
              <Field label="Tipo" placeholder="Artigo, TCC, dissertação, apresentação..." value={s.pubs[i].type} onChange={(v) => mut((d) => { d.pubs[i].type = v; })} />
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <Field label="Onde foi publicado ou apresentado" value={s.pubs[i].venue} onChange={(v) => mut((d) => { d.pubs[i].venue = v; })} />
                <Field label="Ano" inputMode="numeric" value={s.pubs[i].year} onChange={(v) => mut((d) => { d.pubs[i].year = v; })} />
              </div>
            </div>
          ),
        }, more(`p${i}-more`, "Quer adicionar outra produção?", (d) => d.pubs, i, blankPub));
      });
    }
  }

  /* ---------- Comum ---------- */
  st.push(yn("courses", "Você fez cursos fora da escola ou da faculdade?", (s) => s.hasCourses, (d, v) => { d.hasCourses = v; setList(d, "courses", v, blankCourse); }));
  if (s.hasCourses) s.courses.forEach((_, i) => {
    st.push({
      id: `c${i}`, title: i === 0 ? "Qual curso?" : "Qual é o outro curso?",
      valid: (s) => !!s.courses[i].name.trim(),
      body: ({ s, mut }) => (
        <div className="space-y-4">
          <Field autoFocus label="Nome do curso" placeholder="Ex.: Excel Básico" value={s.courses[i].name} onChange={(v) => mut((d) => { d.courses[i].name = v; })} />
          <Field label="Instituição" placeholder="Ex.: SENAI, Fundação Bradesco" value={s.courses[i].inst} onChange={(v) => mut((d) => { d.courses[i].inst = v; })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Carga horária" inputMode="numeric" placeholder="Ex.: 40h" value={s.courses[i].hours} onChange={(v) => mut((d) => { d.courses[i].hours = v; })} />
            <Field label="Ano" inputMode="numeric" value={s.courses[i].year} onChange={(v) => mut((d) => { d.courses[i].year = v; })} />
          </div>
        </div>
      ),
    }, more(`c${i}-more`, "Quer adicionar outro curso?", (d) => d.courses, i, blankCourse));
  });
  st.push({
    id: "skills", title: "Marque o que você sabe usar:",
    body: ({ s, mut }) => (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SKILLS.map((k) => {
            const on = s.skills.includes(k);
            return (
              <button type="button" key={k} onClick={() => mut((d) => { d.skills = on ? d.skills.filter((x) => x !== k) : [...d.skills, k]; })}
                className={cn("min-h-12 rounded-xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:border-primary/60")}>
                {k}
              </button>
            );
          })}
        </div>
        <Field label="Sabe fazer mais alguma coisa? Escreve aí." placeholder="Separe por vírgula" value={s.skillsExtra} onChange={(v) => mut((d) => { d.skillsExtra = v; })} />
      </div>
    ),
  });
  st.push(yn("langs", "Você fala outro idioma?", (s) => s.hasLangs, (d, v) => { d.hasLangs = v; setList(d, "langs", v, blankLang); }));
  if (s.hasLangs) s.langs.forEach((_, i) => {
    st.push({
      id: `l${i}`, title: i === 0 ? "Qual idioma e em que nível?" : "Qual é o outro idioma?",
      valid: (s) => !!s.langs[i].lang.trim() && !!s.langs[i].level,
      body: ({ s, mut }) => (
        <div className="space-y-4">
          <Field autoFocus label="Idioma" placeholder="Ex.: Inglês" value={s.langs[i].lang} onChange={(v) => mut((d) => { d.langs[i].lang = v; })} />
          <Options options={LEVELS.map((x) => ({ label: x, value: x.toLowerCase() }))} value={s.langs[i].level} onPick={(v) => mut((d) => { d.langs[i].level = v; })} />
        </div>
      ),
    }, more(`l${i}-more`, "Fala mais algum idioma?", (d) => d.langs, i, blankLang));
  });

  const ini = isIni(s);
  st.push(ini
    ? choice("target", "Que tipo de vaga você está procurando?", ["Jovem aprendiz", "Estágio", "Atendimento e vendas", "Administrativo", "Área técnica", "Ainda não sei"], (s) => s.target, (d, v) => { d.target = v; })
    : text("target", "Qual cargo ou área você busca?", (s) => s.target, (d, v) => { d.target = v; }, { placeholder: "Ex.: Coordenação pedagógica" }));
  st.push(text("pitch", "Em uma frase: por que uma empresa deveria te chamar?", (s) => s.pitch, (d, v) => { d.pitch = v; }, {
    area: true, better: true,
    hint: ini
      ? "Não precisa ser bonito, precisa ser verdade. Ex.: 'Tenho facilidade com atendimento ao público e aprendo rápido.'"
      : "Puxe a sua formação e o seu tempo de experiência. Ex.: 'Pedagoga com 6 anos de sala de aula, buscando coordenação pedagógica.'",
    onNext: (d) => { if (!d.objectiveTouched) d.objective = buildObjective(d); },
  }));
  st.push(text("objective", "Este é o seu objetivo. Quer ajustar alguma coisa?", (s) => s.objective, (d, v) => { d.objective = v; d.objectiveTouched = true; }, {
    area: true, hint: "Montamos com as suas duas últimas respostas. Edite à vontade.",
  }));
  st.push({ id: "review", review: true, title: "Pronto. Confira e baixe o seu currículo." });
  return st;
}

function hsStep(id: string, title: string): Step {
  return {
    id, title,
    valid: (s) => !!s.hsSchool.trim() && !!s.hsYear.trim(),
    body: ({ s, mut }) => (
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field autoFocus label="Escola" value={s.hsSchool} onChange={(v) => mut((d) => { d.hsSchool = v; })} />
        <Field label="Ano" inputMode="numeric" placeholder="2020" value={s.hsYear} onChange={(v) => mut((d) => { d.hsYear = v; })} />
      </div>
    ),
  };
}
