import { jsPDF } from "jspdf";
import type { Doc } from "./resume";

type Op = { h: number; draw: (y: number) => void };

function layout(doc: Doc, k: number) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const M = 18, W = 210 - 2 * M, TOP = 18, BOT = 297 - 15;
  const lh = (size: number) => size * 0.3528 * 1.32;
  pdf.setTextColor(0, 0, 0);
  pdf.setDrawColor(0, 0, 0);
  const textOp = (txt: string, size: number, bold: boolean, after = 0): Op => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(txt, W) as string[];
    return {
      h: lines.length * lh(size) + after,
      draw: (y) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.text(lines, M, y + lh(size) * 0.78, { lineHeightFactor: 1.32 });
      },
    };
  };
  let y = TOP;
  const place = (ops: Op[]) => {
    for (const o of ops) {
      if (y + o.h > BOT) { pdf.addPage(); y = TOP; }
      o.draw(y); y += o.h;
    }
  };
  place([textOp(doc.name, 20 * k, true, 1.5), textOp(doc.contact, 9.5 * k, false, 2)]);

  for (const sec of doc.sections) {
    const tsize = 10.5 * k;
    const title: Op = {
      h: 5 * k + lh(tsize) + 2.6,
      draw: (yy) => {
        const base = yy + 5 * k;
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(tsize);
        pdf.text(sec.title.toUpperCase(), M, base + lh(tsize) * 0.78, { charSpace: 0.3 });
        pdf.setLineWidth(0.25);
        pdf.line(M, base + lh(tsize) + 0.6, M + W, base + lh(tsize) + 0.6);
      },
    };
    const items: Op[] = sec.items.map((it) => {
      const parts = [it.head ? textOp(it.head, 10 * k, true) : null, it.body ? textOp(it.body, 10 * k, false) : null].filter(Boolean) as Op[];
      const h = parts.reduce((a, p) => a + p.h, 0) + 1.8 * k;
      return { h, draw: (yy) => { let c = yy; parts.forEach((p) => { p.draw(c); c += p.h; }); } };
    });
    const total = title.h + items.reduce((a, i) => a + i.h, 0);
    if (y + total > BOT && total <= BOT - TOP) { pdf.addPage(); y = TOP; }
    else if (y + title.h + (items[0]?.h ?? 0) > BOT) { pdf.addPage(); y = TOP; }
    place([title, ...items]);
  }
  return pdf;
}

export function makePdf(doc: Doc, maxPages: number) {
  for (let k = 1; k >= 0.78; k -= 0.04) {
    const p = layout(doc, k);
    if (p.getNumberOfPages() <= maxPages) return p;
  }
  return layout(doc, 0.78);
}
