import { describe, expect, it } from "vitest";
import { PeriodeSondage } from "../../src/domain/PeriodeSondage";

describe("PeriodeSondage", () => {
    const debut = new Date("2026-11-24T09:00:00Z");
    const fin = new Date("2026-11-24T10:00:00Z");

    it("accepte une période valide", () => {
        const periode = new PeriodeSondage(debut, fin);

        expect(periode.dateDebut).toEqual(debut);
        expect(periode.dateFin).toEqual(fin);
    });

    it("rejette une date de début invalide", () => {
        expect(() => new PeriodeSondage(new Date(NaN), fin)).toThrow(
            "Les dates doivent être valides",
        );
    });

    it("rejette un début égal à la fin", () => {
        expect(() => new PeriodeSondage(debut, debut)).toThrow(
            "La date de début doit précéder la date de fin",
        );
    });
});
