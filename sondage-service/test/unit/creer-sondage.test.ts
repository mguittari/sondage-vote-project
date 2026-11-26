import { describe, expect, it } from "vitest";
import { AssociationIntrouvable, CreerSondage } from "../../src/application/creer-sondage";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import { OptionsInsuffisantes, type NouveauSondage, type Sondage } from "../../src/domain/sondage";
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
  const enregistres: Sondage[] = [];
  const associationsVerifiees: string[] = [];
  const usage = new CreerSondage(
    { existe: async id => {
      associationsVerifiees.push(id);
      return associationExiste;
    } },
    {
      trouverParId: async () => null,
      enregistrer: async sondage => { enregistres.push(sondage); },
    },
    new IdsSequentiels("sondage"),
  );
  return { usage, enregistres, associationsVerifiees };
}

describe("CreerSondage", () => {
  it("crée et enregistre un sondage lié à une association existante", async () => {
    const { usage, enregistres, associationsVerifiees } = contexte();

    const sondage = await usage.executer(commande);

    expect(associationsVerifiees).toEqual(["association-1"]);
    expect(sondage.id).toBe("sondage-001");
    expect(sondage.associationId).toBe("association-1");
    expect(sondage.createurId).toBe("createur-1");
    expect(sondage.options).toEqual(["Aix", "Toulon"]);
    expect(sondage.votes).toEqual([]);
    expect(enregistres).toEqual([sondage]);
  });

  it("refuse une association introuvable sans enregistrer de sondage", async () => {
    const { usage, enregistres } = contexte(false);

    await expect(usage.executer(commande)).rejects.toThrow(AssociationIntrouvable);
    expect(enregistres).toHaveLength(0);
  });

  it("laisse le domaine refuser un sondage invalide", async () => {
    const { usage, enregistres } = contexte();

    await expect(usage.executer({ ...commande, options: ["Aix"] }))
      .rejects.toThrow(OptionsInsuffisantes);
    expect(enregistres).toHaveLength(0);
  });
});
