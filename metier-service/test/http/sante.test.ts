import { describe, expect, it } from "vitest";
import { construireApp } from "../../src/infrastructure/http/app";

describe("API", () => {
  it("GET /sante répond 200", async () => {
    const app = await construireApp();
    const r = await app.inject({ method: "GET", url: "/sante" });
    expect(r.json()).toEqual({ statut: "ok" });
  });

  it("sert le contrat OpenAPI", async () => {
    const app = await construireApp();
    expect((await app.inject({ method: "GET", url: "/docs/json" })).json().openapi).toBe("3.1.0");
  });
});
