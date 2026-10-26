const EX = [
  { weak: "Ajudei no mercado do meu tio.", strong: "Auxiliar no comércio da família (2024-2025) — atendimento a clientes, organização de estoque e fechamento de caixa aos sábados.", why: "O segundo mostra o que você fazia de fato." },
  { weak: "Trabalhei como professora.", strong: "Professora de Ciências (2021-2026) — turmas de 6º a 9º ano, elaboração de material próprio e coordenação de projetos de eletiva.", why: "O segundo mostra o tamanho e o alcance do trabalho." },
  { weak: "Sou proativo, dinâmico e trabalho bem em equipe.", strong: "Excel básico, atendimento ao cliente, organização de estoque, Canva.", why: "O primeiro é o que todo mundo escreve; o segundo dá para comprovar." },
  { weak: "Busco uma oportunidade para crescer profissionalmente.", strong: "Primeiro emprego como jovem aprendiz em atendimento. Tenho facilidade com público e curso de Excel básico.", why: "O segundo diz o que você quer e o que já traz." },
];

export function BetterPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="animate-step max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 shadow-paper sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl">Como fica melhor</h3>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-muted">Fechar</button>
        </div>
        <div className="space-y-5">
          {EX.map((e) => (
            <div key={e.weak} className="space-y-2 border-b border-border pb-5 last:border-0">
              <p className="text-sm"><span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold uppercase text-muted-foreground">Fraco</span><span className="text-muted-foreground line-through decoration-muted-foreground/40">{e.weak}</span></p>
              <p className="text-sm"><span className="mr-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold uppercase text-primary">Forte</span>{e.strong}</p>
              <p className="text-xs text-muted-foreground">Por quê: {e.why}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
