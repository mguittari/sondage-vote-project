import type { Sondage } from "../domain/sondage";

export interface SondageRepository {
  trouverParId(id: string): Promise<Sondage | null>;
  enregistrer(sondage: Sondage): Promise<void>;
}

export interface MembreRepository {
  appartientA(associationId: string, utilisateurId: string): Promise<boolean>;
}

export interface GenerateurId {
  nouveau(): string;
}

export interface Horloge {
  maintenant(): Date;
}
