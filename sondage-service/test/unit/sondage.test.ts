import { describe, expect, it } from "vitest";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";
import {
  BulletinVide,
  ChoixEnDouble,
  ChoixUniqueDepasse,
  DejaVote,
  OptionInconnue,
  OptionsEnDouble,
  OptionsInsuffisantes,
  QuestionVide,
  Sondage,
  SondageHorsPeriode,
  type NouveauSondage,
  type Vote,
} from "../../src/domain/sondage";


const DEBUT = new Date("2026-12-01T00:00:00Z");
const FIN = new Date("2026-12-10T00:00:00Z");
const PENDANT = new Date("2026-12-05T10:00:00Z");
const AVANT = new Date("2026-11-30T23:59:59Z");
const APRES = new Date("2026-12-11T00:00:00Z");


function unSondage(surcharge: Partial<NouveauSondage> = {}): Sondage {
  return Sondage.creer({
    id: "s-001",
    question: "Où organiser la cérémonie des tuteurs ?",
    options: ["Aix", "Marseille", "Toulon"],
    mode: "unique",
    periode: new PeriodeSondage(DEBUT, FIN),
    associationId: "a-001",
    createurId: "u-createur",
    ...surcharge,
  });
}

describe("Sondage.creer", () => {
  it("crée un sondage valide, sans aucun vote", () => {
    const sondage = unSondage();

    expect(sondage.id).toBe("s-001");
    expect(sondage.question).toBe("Où organiser la cérémonie des tuteurs ?");
    expect(sondage.options).toEqual(["Aix", "Marseille", "Toulon"]);
    expect(sondage.mode).toBe("unique");
    expect(sondage.votes).toEqual([]);
  });

  it("refuse une question vide", () => {
    expect(() => unSondage({ question: "   " })).toThrow(QuestionVide);
  });

  it("refuse moins de deux options", () => {
    expect(() => unSondage({ options: ["Aix"] })).toThrow(OptionsInsuffisantes);
  });

  it("refuse une option proposée deux fois", () => {
    expect(() => unSondage({ options: ["Aix", "Toulon", "Aix"] })).toThrow(OptionsEnDouble);
  });

  it("garde sa propre copie des options reçues", () => {
    const options = ["Aix", "Marseille"];
    const sondage = unSondage({ options });

    options.push("Toulon");

    expect(sondage.options).toEqual(["Aix", "Marseille"]);
  });
});

describe("Sondage.voter : cas valides", () => {
  it("enregistre un vote à choix unique", () => {
    const sondage = unSondage();

    const vote = sondage.voter("v-001", "u-1", ["Aix"], PENDANT);

    expect(vote).toEqual({ id: "v-001", votantId: "u-1", options: ["Aix"], le: PENDANT });
    expect(sondage.votes).toHaveLength(1);
  });

  it("accepte plusieurs options dans un sondage à choix multiple", () => {
    const sondage = unSondage({ mode: "multiple" });

    const vote = sondage.voter("v-001", "u-1", ["Aix", "Toulon"], PENDANT);

    expect(vote.options).toEqual(["Aix", "Toulon"]);
  });

  it("accepte des votants différents", () => {
    const sondage = unSondage();

    sondage.voter("v-001", "u-1", ["Aix"], PENDANT);
    sondage.voter("v-002", "u-2", ["Toulon"], PENDANT);

    expect(sondage.votes).toHaveLength(2);
  });

  it("accepte un vote à l'instant exact de l'ouverture", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Aix"], DEBUT)).not.toThrow();
  });
});

describe("Sondage.voter : invariant de période", () => {
  it("refuse un vote avant l'ouverture", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Aix"], AVANT)).toThrow(SondageHorsPeriode);
  });

  it("refuse un vote à l'instant exact de la clôture", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Aix"], FIN)).toThrow(SondageHorsPeriode);
  });

  it("refuse un vote après la clôture", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Aix"], APRES)).toThrow(SondageHorsPeriode);
  });
});

describe("Sondage.voter : invariant un vote par votant", () => {
  it("refuse un second vote du même votant", () => {
    const sondage = unSondage();
    sondage.voter("v-001", "u-1", ["Aix"], PENDANT);

    expect(() => sondage.voter("v-002", "u-1", ["Toulon"], PENDANT)).toThrow(DejaVote);
  });

  it("refuse le même vote rejoué (piège du sujet)", () => {
    const sondage = unSondage();
    sondage.voter("v-001", "u-1", ["Aix"], PENDANT);

    expect(() => sondage.voter("v-001", "u-1", ["Aix"], PENDANT)).toThrow(DejaVote);
  });
});

describe("Sondage.voter : validité du bulletin", () => {
  it("refuse un bulletin sans option", () => {
    expect(() => unSondage().voter("v-001", "u-1", [], PENDANT)).toThrow(BulletinVide);
  });

  it("refuse une option qui n'existe pas dans le sondage", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Nice"], PENDANT)).toThrow(OptionInconnue);
  });

  it("refuse une option cochée deux fois", () => {
    const sondage = unSondage({ mode: "multiple" });

    expect(() => sondage.voter("v-001", "u-1", ["Aix", "Aix"], PENDANT)).toThrow(ChoixEnDouble);
  });

  it("refuse plusieurs options dans un sondage à choix unique", () => {
    expect(() => unSondage().voter("v-001", "u-1", ["Aix", "Toulon"], PENDANT)).toThrow(
      ChoixUniqueDepasse,
    );
  });
});

describe("Sondage.voter : ordre des vérifications et intégrité", () => {
  it("signale la clôture avant le vote déjà existant", () => {
    const sondage = unSondage();
    sondage.voter("v-001", "u-1", ["Aix"], PENDANT);

    expect(() => sondage.voter("v-002", "u-1", ["Aix"], APRES)).toThrow(SondageHorsPeriode);
  });

  it("ne modifie pas le sondage quand un vote est refusé", () => {
    const sondage = unSondage();
    sondage.voter("v-001", "u-1", ["Aix"], PENDANT);

    expect(() => sondage.voter("v-002", "u-2", ["Nice"], PENDANT)).toThrow(OptionInconnue);
    expect(sondage.votes).toHaveLength(1);
  });

  it("ne laisse pas contourner l'invariant par la liste des votes", () => {
    const sondage = unSondage();
    const intrus: Vote = { id: "v-999", votantId: "u-1", options: ["Aix"], le: PENDANT };

    (sondage.votes as Vote[]).push(intrus);

    expect(sondage.votes).toHaveLength(0);
    expect(() => sondage.voter("v-001", "u-1", ["Aix"], PENDANT)).not.toThrow();
  });
});
