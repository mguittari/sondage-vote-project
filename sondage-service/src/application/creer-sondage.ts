import { Sondage, type NouveauSondage } from "../domain/sondage";
import { ErreurApplication } from "./erreurs";
import type { AssociationRepository, GenerateurId, SondageRepository } from "./ports";

export class AssociationIntrouvable extends ErreurApplication {
  readonly code = "association-introuvable";
  constructor() { super("Association introuvable"); }
}

export class CreerSondage {
  constructor(
    private readonly associations: AssociationRepository,
    private readonly sondages: SondageRepository,
    private readonly ids: GenerateurId,
  ) {}

  async executer(commande: Omit<NouveauSondage, "id">): Promise<Sondage> {
    if (!await this.associations.existe(commande.associationId)) {
      throw new AssociationIntrouvable();
    }

    const sondage = Sondage.creer({ ...commande, id: this.ids.nouveau() });
    await this.sondages.enregistrer(sondage);
    return sondage;
  }
}
