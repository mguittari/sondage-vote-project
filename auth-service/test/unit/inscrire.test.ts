import { describe, expect, it } from "vitest";
import { Inscrire } from "../../src/application/cas-usage";
import { EmailDejaUtilise, EmailInvalide } from "../../src/domain/modele";
import { UtilisateurRepositoryMemoire } from "../../src/infrastructure/memoire/repositories-memoire";
import { RolesParConfiguration } from "../../src/infrastructure/systeme/systeme";

const hacheur = { hacher: async (m: string) => `hash(${m})`, verifier: async (h: string, m: string) => h === `hash(${m})` };
let n = 0;
const ids = { nouveau: () => `id-${++n}` };

describe("Inscrire", () => {
  it("normalise l'e-mail et hache le mot de passe", async () => {
    const repo = new UtilisateurRepositoryMemoire();
    const u = await new Inscrire(repo, hacheur, ids, new RolesParConfiguration()).executer({ email: "Ada@Exemple.fr", motDePasse: "correct horse battery" });
    expect(u.email.valeur).toBe("ada@exemple.fr");
    expect(u.hashMotDePasse).not.toBe("correct horse battery");
  });

  it("refuse un e-mail déjà inscrit et un e-mail invalide", async () => {
    const inscrire = new Inscrire(new UtilisateurRepositoryMemoire(), hacheur, ids, new RolesParConfiguration());
    await inscrire.executer({ email: "ada@exemple.fr", motDePasse: "correct horse battery" });
    await expect(inscrire.executer({ email: "ADA@exemple.fr", motDePasse: "x".repeat(12) })).rejects.toThrow(EmailDejaUtilise);
    await expect(inscrire.executer({ email: "pas-un-email", motDePasse: "x".repeat(12) })).rejects.toThrow(EmailInvalide);
  });
});
