import { describe, expect, it } from "vitest";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import { Sondage } from "../../src/domain/sondage";
import { SondageRepositoryMemoire } from "../../src/infrastructure/memoire/sondage-repository-memoire";

const pendant = new Date("2026-12-05T10:00:00Z");

function unSondage(): Sondage {
  return Sondage.creer({
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
}

describe("SondageRepositoryMemoire", () => {
  it("renvoie null si le sondage n'existe pas", async () => {
    const repository = new SondageRepositoryMemoire();
    expect(await repository.trouverParId("absent")).toBeNull();
  });

  it("ne persiste pas les modifications d'un objet chargé avant enregistrement", async () => {
    const repository = new SondageRepositoryMemoire();
    const original = unSondage();
    await repository.enregistrer(original);

    original.voter("vote-original", "membre-original", ["Aix"], pendant);
    const charge = await repository.trouverParId(original.id);
    expect(charge).not.toBeNull();
    expect(charge).not.toBe(original);
    expect(charge?.votes).toHaveLength(0);

    charge!.voter("vote-1", "membre-1", ["Toulon"], pendant);
    expect((await repository.trouverParId(original.id))?.votes).toHaveLength(0);

    await repository.enregistrer(charge!);
    const recharge = await repository.trouverParId(original.id);
    expect(recharge?.votes).toHaveLength(1);
    expect(recharge?.votes[0].votantId).toBe("membre-1");
  });

  it("copie aussi les dates et les options des votes", async () => {
    const repository = new SondageRepositoryMemoire();
    const sondage = unSondage();
    sondage.voter("vote-1", "membre-1", ["Aix"], pendant);
    await repository.enregistrer(sondage);

    const charge = await repository.trouverParId(sondage.id);
    expect(charge).not.toBeNull();
    charge!.votes[0].le.setFullYear(2030);
    (charge!.votes[0].options as string[]).push("Toulon");

    const recharge = await repository.trouverParId(sondage.id);
    expect(recharge?.votes[0].le).toEqual(pendant);
    expect(recharge?.votes[0].options).toEqual(["Aix"]);
  });
});
