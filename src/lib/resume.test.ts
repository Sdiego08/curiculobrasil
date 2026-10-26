import { describe, expect, it } from "vitest";
import { polish, initialState } from "./resume";
import { buildSteps } from "./steps";

describe("currículo", () => {
  it("transforma a resposta em texto de currículo", () => {
    expect(polish("atendia os clientes e organizava o estoque")).toBe("Atendimento a clientes e organização de estoque");
  });
  it("não inventa: texto sem verbo conhecido só é capitalizado", () => {
    expect(polish("eu cuidei do meu irmão")).toBe("Cuidei do meu irmão");
  });
  it("ensino médio leva ao caminho iniciante", () => {
    const ids = buildSteps({ ...initialState(), profile: "A" }).map((s) => s.id);
    expect(ids).toContain("ini-intro");
    expect(ids).not.toContain("f-intro");
  });
  it("produção acadêmica só para graduação ou pós", () => {
    expect(buildSteps({ ...initialState(), profile: "D" }).map((s) => s.id)).toContain("f-pubs");
    expect(buildSteps({ ...initialState(), profile: "C" }).map((s) => s.id)).not.toContain("f-pubs");
  });
});
