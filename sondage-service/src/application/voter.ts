import type { Vote } from "../domain/sondage";
import { ErreurApplication } from "./erreurs";
import type { GenerateurId, Horloge, MembreRepository, SondageRepository } from "./ports";

export class SondageIntrouvable extends ErreurApplication {
  readonly code = "sondage-introuvable";
  constructor() { super("Sondage introuvable"); }
}

export class MembreRequis extends ErreurApplication {
  readonly code = "membre-requis";
  constructor() { super("Le vote est réservé aux membres de l'association"); }
}

export class Voter {
  constructor(
    private readonly sondages: SondageRepository,
    private readonly membres: MembreRepository,
    private readonly ids: GenerateurId,
    private readonly horloge: Horloge,
  ) {}

  async executer(commande: { sondageId: string; votantId: string; choix: string[] }): Promise<Vote> {
    const sondage = await this.sondages.trouverParId(commande.sondageId);
    if (!sondage) throw new SondageIntrouvable();
    if (!await this.membres.appartientA(sondage.associationId, commande.votantId)) {
      throw new MembreRequis();
    }

    const vote = sondage.voter(
      this.ids.nouveau(),
      commande.votantId,
      commande.choix,
      this.horloge.maintenant(),
    );
    await this.sondages.enregistrer(sondage);
    return vote;
  }
}
