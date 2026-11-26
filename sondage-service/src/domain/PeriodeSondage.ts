export class PeriodeSondage {

    private readonly debut: Date;
    private readonly fin: Date;

    constructor(debut: Date, fin: Date) {

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
            throw new Error("Les dates doivent être valides");
        }

        if (debut >= fin) {
            throw new Error(
                "La date de début doit précéder la date de fin"
            );
        }

        this.debut = new Date(debut.getTime());
        this.fin = new Date(fin.getTime());
    }

    get dateDebut(): Date {
        return new Date(this.debut.getTime());
    }

    get dateFin(): Date {
        return new Date(this.fin.getTime());
    }

    contient(date: Date): boolean {
        return date >= this.debut && date < this.fin;
    }

    equals(autre: PeriodeSondage): boolean {
        return (
            this.debut.getTime() === autre.debut.getTime() &&
            this.fin.getTime() === autre.fin.getTime()
        );
    }
}
