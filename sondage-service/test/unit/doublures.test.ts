import { describe, expect, it } from "vitest";
import { HorlogeFixe, IdsSequentiels } from "./doublures";

describe("doublures", () => {
  it("l'horloge fixe renvoie toujours le même instant", () => {
    const h = new HorlogeFixe(new Date("2026-11-24T09:00:00Z"));
    expect(h.maintenant().toISOString()).toBe("2026-11-24T09:00:00.000Z");
  });

  it("les ids sont prévisibles", () => {
    const ids = new IdsSequentiels("x");
    expect([ids.nouveau(), ids.nouveau()]).toEqual(["x-001", "x-002"]);
  });
});
