import type { Role, Utilisateur } from "../domain/modele";

export interface UtilisateurRepository {
  parEmail(email: string): Promise<Utilisateur | null>;
  parId(id: string): Promise<Utilisateur | null>;
  enregistrer(u: Utilisateur): Promise<void>;
}

export interface HacheurMotDePasse {
  hacher(motDePasse: string): Promise<string>;
  verifier(hash: string, motDePasse: string): Promise<boolean>;
}

export interface PolitiqueRoles {
  roleInitial(email: string): Role;
}

export interface Horloge {
  maintenant(): Date;
}

export interface GenerateurId {
  nouveau(): string;
}
