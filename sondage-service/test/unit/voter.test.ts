import { describe, expect, it } from "vitest";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import {
  DejaVote,
  OptionInconnue,
  Sondage,
  SondageHorsPeriode,
} from "../../src/domain/sondage";
import { MembreRequis, SondageIntrouvable, Voter } from "../../src/application/voter";
import { SondageRepositoryMemoire } from "../../src/infrastructure/memoire/sondage-repository-memoire";
import { HorlogeFixe, IdsSequentiels } from "./doublures";

const maintenant = new Date("2026-12-05T10:00:00Z");
const commande = { sondageId: "sondage-1", votantId: "membre-1", choix: ["Aix"] };

async function contexte(date = maintenant, avecSondage = true) {
  const sondages = new SondageRepositoryMemoire();
  const sondage: Sondage = Sondage.creer({
    id: "sondage-1",
    question: "Où se réunir ?",
    options: ["Aix", "Toulon"],
    mode: "unique",
    periode: new PeriodeSondage(
      new Date("2026-12-01T00:00:00Z"),
      new Date("2026-12-10T00:00:00Z"),
    ),
    associationId: "association-1",
    createurId: "createur-1",
  });
  if (avecSondage) await sondages.enregistrer(sondage);
  let membre = true;
  const usage = new Voter(
    sondages,
    { appartientA: async (associationId, utilisateurId) =>
      membre && associationId === "association-1" && utilisateurId === "membre-1" },
    new IdsSequentiels("vote"),
    new HorlogeFixe(date),
  );
  return {
    usage,
    sondages,
    sansAdhesion: () => { membre = false; },
  };
}

describe("Voter", () => {
  it("enregistre le vote d'un membre dans le sondage de son association", async () => {
    const contexteVote = await contexte();

    const vote = await contexteVote.usage.executer(commande);

    expect(vote).toEqual({
      id: "vote-001",
      votantId: "membre-1",
      options: ["Aix"],
      le: maintenant,
    });
    expect((await contexteVote.sondages.trouverParId(commande.sondageId))?.votes).toEqual([vote]);
  });

  it("refuse un sondage introuvable", async () => {
    const contexteVote = await contexte(maintenant, false);
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(SondageIntrouvable);
    expect(await contexteVote.sondages.trouverParId(commande.sondageId)).toBeNull();
  });

  it("refuse un utilisateur qui n'est pas membre de l'association", async () => {
    const contexteVote = await contexte();
    contexteVote.sansAdhesion();
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(MembreRequis);
    expect((await contexteVote.sondages.trouverParId(commande.sondageId))?.votes).toHaveLength(0);
  });

  it("laisse le domaine refuser un sondage fermé", async () => {
    const contexteVote = await contexte(new Date("2026-12-10T00:00:00Z"));
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(SondageHorsPeriode);
    expect((await contexteVote.sondages.trouverParId(commande.sondageId))?.votes).toHaveLength(0);
  });

  it("laisse le domaine refuser une option inconnue", async () => {
    const contexteVote = await contexte();
    await expect(contexteVote.usage.executer({ ...commande, choix: ["Nice"] }))
      .rejects.toThrow(OptionInconnue);
    expect((await contexteVote.sondages.trouverParId(commande.sondageId))?.votes).toHaveLength(0);
  });

  it("laisse le domaine refuser un second vote du même membre", async () => {
    const contexteVote = await contexte();
    await contexteVote.usage.executer(commande);
    await expect(contexteVote.usage.executer({ ...commande, choix: ["Toulon"] }))
      .rejects.toThrow(DejaVote);
    expect((await contexteVote.sondages.trouverParId(commande.sondageId))?.votes).toHaveLength(1);
  });
});
