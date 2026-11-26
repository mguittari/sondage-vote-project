import type { SondageRepository } from "../../application/ports";
import { PeriodeSondage } from "../../domain/PeriodeSondage";
import { Sondage } from "../../domain/sondage";

export class SondageRepositoryMemoire implements SondageRepository {
  private readonly sondages = new Map<string, Sondage>();

  async trouverParId(id: string): Promise<Sondage | null> {
    const sondage = this.sondages.get(id);
    return sondage ? copier(sondage) : null;
  }

  async enregistrer(sondage: Sondage): Promise<void> {
    this.sondages.set(sondage.id, copier(sondage));
  }
}

function copier(sondage: Sondage): Sondage {
  return Sondage.restaurer(sondage.id, {
    question: sondage.question,
    options: [...sondage.options],
    mode: sondage.mode,
    periode: new PeriodeSondage(
      sondage.periode.dateDebut,
      sondage.periode.dateFin,
    ),
    associationId: sondage.associationId,
    createurId: sondage.createurId,
    votes: sondage.votes.map(vote => ({
      id: vote.id,
      votantId: vote.votantId,
      options: [...vote.options],
      le: new Date(vote.le.getTime()),
    })),
  });
}
