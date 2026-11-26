import { describe, expect, it } from "vitest";
import { Inscrire } from "../../src/application/cas-usage";
import { HacheurArgon2 } from "../../src/infrastructure/crypto/argon2";
import { construireApp } from "../../src/infrastructure/http/app";
import { UtilisateurRepositoryMemoire } from "../../src/infrastructure/memoire/repositories-memoire";
import { GenerateurUuid, RolesParConfiguration } from "../../src/infrastructure/systeme/systeme";

const app = async () => construireApp({
  inscrire: new Inscrire(new UtilisateurRepositoryMemoire(), new HacheurArgon2(), new GenerateurUuid(), new RolesParConfiguration()),
});

describe("POST /auth/inscription", () => {
  it("201 puis 409 sur le même e-mail", async () => {
    const a = await app();
    const corps = { email: "ada@exemple.fr", motDePasse: "correct horse battery" };
    expect((await a.inject({ method: "POST", url: "/auth/inscription", payload: corps })).statusCode).toBe(201);
    const r = await a.inject({ method: "POST", url: "/auth/inscription", payload: corps });
    expect(r.statusCode).toBe(409);
    expect(r.headers["content-type"]).toContain("application/problem+json");
  });

  it("400 sur un mot de passe trop court", async () => {
    const r = await (await app()).inject({ method: "POST", url: "/auth/inscription", payload: { email: "a@b.fr", motDePasse: "court" } });
    expect(r.statusCode).toBe(400);
  });
});
