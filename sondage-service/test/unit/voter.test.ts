import { describe, expect, it } from "vitest";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import {
  DejaVote,
  OptionInconnue,
  Sondage,
  SondageHorsPeriode,
} from "../../src/domain/sondage";
import { MembreRequis, SondageIntrouvable, Voter } from "../../src/application/voter";
import { HorlogeFixe, IdsSequentiels } from "./doublures";

const maintenant = new Date("2026-12-05T10:00:00Z");
const commande = { sondageId: "sondage-1", votantId: "membre-1", choix: ["Aix"] };

function contexte(date = maintenant) {
  let sondage: Sondage | null = Sondage.creer({
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
  let membre = true;
  let enregistrements = 0;
  const usage = new Voter(
    {
      trouverParId: async () => sondage,
      enregistrer: async () => { enregistrements++; },
    },
    { appartientA: async (associationId, utilisateurId) =>
      membre && associationId === "association-1" && utilisateurId === "membre-1" },
    new IdsSequentiels("vote"),
    new HorlogeFixe(date),
  );
  return {
    usage,
    get sondage() { return sondage; },
    get enregistrements() { return enregistrements; },
    sansSondage: () => { sondage = null; },
    sansAdhesion: () => { membre = false; },
  };
}

describe("Voter", () => {
  it("enregistre le vote d'un membre dans le sondage de son association", async () => {
    const contexteVote = contexte();

    const vote = await contexteVote.usage.executer(commande);

    expect(vote).toEqual({
      id: "vote-001",
      votantId: "membre-1",
      options: ["Aix"],
      le: maintenant,
    });
    expect(contexteVote.sondage?.votes).toEqual([vote]);
    expect(contexteVote.enregistrements).toBe(1);
  });

  it("refuse un sondage introuvable", async () => {
    const contexteVote = contexte();
    contexteVote.sansSondage();
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(SondageIntrouvable);
    expect(contexteVote.enregistrements).toBe(0);
  });

  it("refuse un utilisateur qui n'est pas membre de l'association", async () => {
    const contexteVote = contexte();
    contexteVote.sansAdhesion();
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(MembreRequis);
    expect(contexteVote.sondage?.votes).toHaveLength(0);
    expect(contexteVote.enregistrements).toBe(0);
  });

  it("laisse le domaine refuser un sondage fermé", async () => {
    const contexteVote = contexte(new Date("2026-12-10T00:00:00Z"));
    await expect(contexteVote.usage.executer(commande)).rejects.toThrow(SondageHorsPeriode);
    expect(contexteVote.enregistrements).toBe(0);
  });

  it("laisse le domaine refuser une option inconnue", async () => {
    const contexteVote = contexte();
    await expect(contexteVote.usage.executer({ ...commande, choix: ["Nice"] }))
      .rejects.toThrow(OptionInconnue);
    expect(contexteVote.enregistrements).toBe(0);
  });

  it("laisse le domaine refuser un second vote du même membre", async () => {
    const contexteVote = contexte();
    await contexteVote.usage.executer(commande);
    await expect(contexteVote.usage.executer({ ...commande, choix: ["Toulon"] }))
      .rejects.toThrow(DejaVote);
    expect(contexteVote.sondage?.votes).toHaveLength(1);
    expect(contexteVote.enregistrements).toBe(1);
  });
});
