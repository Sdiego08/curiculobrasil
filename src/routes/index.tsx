import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildSteps, type Draft } from "@/lib/steps";
import { buildDoc, initialState, isIni, type State } from "@/lib/resume";
import { ResumeView } from "@/components/ResumeView";
import { BetterPanel } from "@/components/BetterPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Currículo — monte o seu respondendo perguntas" },
      { name: "description", content: "Monte seu currículo respondendo uma pergunta de cada vez e baixe em PDF. Nada é salvo em servidor." },
      { property: "og:title", content: "Meu Currículo" },
      { property: "og:description", content: "Monte seu currículo respondendo uma pergunta de cada vez e baixe em PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function App() {
  const [s, setS] = useState<State>(initialState);
  const [cur, setCur] = useState("welcome");
  const [better, setBetter] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const steps = useMemo(() => buildSteps(s), [s]);
  let idx = steps.findIndex((x) => x.id === cur);
  if (idx < 0) idx = 0;
  const step = steps[idx];
  const valid = !step.valid || step.valid(s);

  const mut = (fn: Draft) => setS((p) => { const d = structuredClone(p); fn(d); return d; });
  const goFrom = (fn?: Draft) => {
    const d = structuredClone(s);
    fn?.(d);
    const ns = buildSteps(d);
    const i = ns.findIndex((x) => x.id === step.id);
    const target = Math.min(i >= 0 ? i + 1 : idx, ns.length - 1);
    setS(d); setCur(ns[target].id); window.scrollTo(0, 0);
  };
  const next = () => { if (valid) goFrom(step.onNext); };
  const back = () => { if (idx > 0) { setCur(steps[idx - 1].id); window.scrollTo(0, 0); } };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.isComposing || better) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "BUTTON") return;
      if (step.review) return;
      e.preventDefault(); next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const saveDraft = () => download(new Blob([JSON.stringify({ app: "meu-curriculo", version: 1, cur, state: s }, null, 2)], { type: "application/json" }), "rascunho-curriculo.json");
  const loadDraft = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      setS({ ...initialState(), ...data.state });
      setCur(data.cur || "name");
    } catch { alert("Não foi possível ler esse arquivo de rascunho."); }
    if (fileRef.current) fileRef.current.value = "";
  };
  const doc = useMemo(() => buildDoc(s), [s]);
  const downloadPdf = async () => {
    const { makePdf } = await import("@/lib/pdf");
    const pdf = makePdf(doc, isIni(s) ? 1 : 2);
    download(pdf.output("blob"), `Curriculo-${(doc.name || "meu").trim().replace(/\s+/g, "-")}.pdf`);
  };

  const pre = !s.profile;
  const progress = pre ? (idx / 20) * 100 : (idx / (steps.length - 1)) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-5">
        <span className="font-display text-lg">Meu Currículo</span>
        <div className="flex items-center gap-4 text-sm">
          {!pre && <span className="text-muted-foreground">Etapa {idx + 1} de {steps.length}</span>}
          {idx > 1 && <button type="button" onClick={saveDraft} className="font-medium text-primary hover:underline">Salvar rascunho</button>}
        </div>
      </header>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => loadDraft(e.target.files?.[0])} />

      <main className="flex flex-1 items-start justify-center px-5 py-10 sm:items-center">
        <div key={step.id} className={cn("animate-step w-full", step.review ? "max-w-3xl" : "max-w-xl")}>
          <h1 className={cn("font-display leading-[1.15] text-foreground text-balance", String(step.title).length > 70 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl")}>{step.title}</h1>
          {step.hint && <p className="mt-3 text-base text-muted-foreground">{step.hint}</p>}
          {step.body && <div className="mt-8">{step.body({ s, mut, go: goFrom, load: () => fileRef.current?.click() })}</div>}
          {step.better && (
            <button type="button" onClick={() => setBetter(true)} className="mt-3 text-sm text-primary underline-offset-4 hover:underline">Como fica melhor</button>
          )}
          {step.review && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={downloadPdf} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">Baixar PDF</button>
                <button type="button" onClick={saveDraft} className="rounded-full border border-input bg-card px-6 py-3 font-medium text-foreground hover:border-primary">Salvar rascunho</button>
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">Carregar rascunho</button>
              </div>
              <p className="text-sm text-muted-foreground">Toque em qualquer parte do currículo para editar.</p>
              <div className="-mx-5 overflow-hidden bg-muted/60 px-3 py-6 sm:mx-0 sm:rounded-2xl sm:px-6">
                <ResumeView doc={doc} onEdit={(k, v) => mut((d) => { d.overrides[k] = v; })} />
              </div>
            </div>
          )}
          {step.optional && (
            <button type="button" onClick={() => goFrom(step.onSkip)} className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Pular essa</button>
          )}
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-5 py-3">
          <button type="button" onClick={back} disabled={idx === 0} className="rounded-full px-5 py-3 font-medium text-muted-foreground transition hover:text-foreground disabled:invisible">Voltar</button>
          {!step.review && (
            <button type="button" onClick={next} disabled={!valid} className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-35 disabled:shadow-none">
              {step.button ?? "Continuar"}
            </button>
          )}
        </div>
        <footer className="px-5 pb-3 text-center text-xs leading-snug text-muted-foreground">
          Seus dados não são salvos em nenhum servidor. Ao fechar esta página, tudo é apagado. Baixe seu PDF antes de sair.
        </footer>
      </div>
      {better && <BetterPanel onClose={() => setBetter(false)} />}
    </div>
  );
}
