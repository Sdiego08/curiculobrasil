import { useState } from "react";
import { type Doc, serialize } from "@/lib/resume";
import { cn } from "@/lib/utils";

export function ResumeView({ doc, onEdit }: { doc: Doc; onEdit: (key: string, value: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [val, setVal] = useState("");
  const open = (key: string, v: string) => { setEditing(key); setVal(v); };
  const save = () => { if (editing) onEdit(editing, val); setEditing(null); };

  const Editor = ({ rows = 4 }: { rows?: number }) => (
    <div className="space-y-2 font-sans">
      <textarea autoFocus rows={rows} value={val} onChange={(e) => setVal(e.target.value)}
        className="w-full rounded-md border border-ink/30 bg-paper p-2 text-sm text-ink outline-none focus:border-ink" />
      <p className="text-xs text-ink/60">Deixe uma linha em branco para separar itens. Apague tudo para tirar a seção.</p>
      <div className="flex gap-2">
        <button type="button" onClick={save} className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper">Salvar</button>
        <button type="button" onClick={() => setEditing(null)} className="rounded-md px-3 py-1.5 text-xs text-ink/70">Cancelar</button>
      </div>
    </div>
  );
  const editable = "cursor-pointer rounded-sm transition hover:bg-ink/[0.04] hover:outline hover:outline-1 hover:outline-offset-4 hover:outline-ink/20";

  return (
    <div className="resume-paper mx-auto w-full max-w-[210mm] bg-paper px-6 py-8 text-ink shadow-paper sm:px-[18mm] sm:py-[18mm]">
      {editing === "name" ? <Editor rows={1} /> : (
        <h1 onClick={() => open("name", doc.name)} className={cn("font-resume text-2xl font-bold leading-tight sm:text-[26px]", editable)}>{doc.name}</h1>
      )}
      {editing === "contact" ? <Editor rows={2} /> : (
        <p onClick={() => open("contact", doc.contact)} className={cn("mt-1 font-resume text-[13px] text-ink", editable)}>{doc.contact}</p>
      )}
      {doc.sections.map((sec) => (
        <section key={sec.key} className="mt-5">
          <h2 className="border-b border-ink pb-1 font-resume text-[13px] font-bold uppercase tracking-[0.08em]">{sec.title}</h2>
          {editing === sec.key ? <div className="mt-2"><Editor rows={6} /></div> : (
            <div onClick={() => open(sec.key, serialize(sec.items))} className={cn("mt-2 space-y-2 font-resume text-[13px] leading-snug", editable)}>
              {sec.items.map((it, i) => (
                <div key={i}>
                  {it.head && <p className="font-bold">{it.head}</p>}
                  {it.body && <p className="whitespace-pre-line">{it.body}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
