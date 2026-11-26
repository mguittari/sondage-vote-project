import { describe, expect, it } from "vitest";
import { AssociationIntrouvable, CreerSondage } from "../../src/application/creer-sondage";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import { OptionsInsuffisantes, type NouveauSondage } from "../../src/domain/sondage";
import { SondageRepositoryMemoire } from "../../src/infrastructure/memoire/sondage-repository-memoire";
import { IdsSequentiels } from "./doublures";

const commande: Omit<NouveauSondage, "id"> = {
  question: "Où se réunir ?",
  options: ["Aix", "Toulon"],
  mode: "unique",
  periode: new PeriodeSondage(
    new Date("2026-12-01T00:00:00Z"),
    new Date("2026-12-10T00:00:00Z"),
  ),
  associationId: "association-1",
  createurId: "createur-1",
};

function contexte(associationExiste = true) {
  const sondages = new SondageRepositoryMemoire();
  const associationsVerifiees: string[] = [];
  const usage = new CreerSondage(
    { existe: async id => {
      associationsVerifiees.push(id);
      return associationExiste;
    } },
    sondages,
    new IdsSequentiels("sondage"),
  );
  return { usage, sondages, associationsVerifiees };
}

describe("CreerSondage", () => {
  it("crée et enregistre un sondage lié à une association existante", async () => {
    const { usage, sondages, associationsVerifiees } = contexte();

    const sondage = await usage.executer(commande);

    expect(associationsVerifiees).toEqual(["association-1"]);
    expect(sondage.id).toBe("sondage-001");
    expect(sondage.associationId).toBe("association-1");
    expect(sondage.createurId).toBe("createur-1");
    expect(sondage.options).toEqual(["Aix", "Toulon"]);
    expect(sondage.votes).toEqual([]);
    expect(await sondages.trouverParId(sondage.id)).toEqual(sondage);
  });

  it("refuse une association introuvable sans enregistrer de sondage", async () => {
    const { usage, sondages } = contexte(false);

    await expect(usage.executer(commande)).rejects.toThrow(AssociationIntrouvable);
    expect(await sondages.trouverParId("sondage-001")).toBeNull();
  });

  it("laisse le domaine refuser un sondage invalide", async () => {
    const { usage, sondages } = contexte();

    await expect(usage.executer({ ...commande, options: ["Aix"] }))
      .rejects.toThrow(OptionsInsuffisantes);
    expect(await sondages.trouverParId("sondage-001")).toBeNull();
  });
});
