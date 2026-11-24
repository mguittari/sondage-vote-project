// Doublures réutilisables dans les tests de cas d'usage.

export class HorlogeFixe {
  constructor(private instant: Date) {}
  maintenant() { return new Date(this.instant); }
}

export class IdsSequentiels {
  private n = 0;
  constructor(private prefixe: string) {}
  nouveau() { return `${this.prefixe}-${String(++this.n).padStart(3, "0")}`; }
}

// UUID prévisibles, pour les tests HTTP dont les routes valident le format UUID.
export class UuidsSequentiels {
  private n = 0;
  constructor(private chiffre: string) {}
  nouveau() { return `${this.chiffre.repeat(8)}-0000-4000-8000-${String(++this.n).padStart(12, "0")}`; }
}
