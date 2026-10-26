<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The app is 100% client-side: no backend, database, auth or network calls with user data; why: the product's core privacy promise.
- Question flow is derived from state by `buildSteps` in src/lib/steps.tsx and the resume by `buildDoc` in src/lib/resume.ts; both screen preview and PDF (jsPDF text layout in src/lib/pdf.ts) render from the same Doc; why: one source of truth for the adaptive flow and output.
