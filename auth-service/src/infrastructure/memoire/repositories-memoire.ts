import type { UtilisateurRepository } from "../../application/ports";
import type { Utilisateur } from "../../domain/modele";

export class UtilisateurRepositoryMemoire implements UtilisateurRepository {
  private parIdMap = new Map<string, Utilisateur>();
  async parEmail(email: string) {
    return [...this.parIdMap.values()].find((u) => u.email.valeur === email) ?? null;
  }
  async parId(id: string) { return this.parIdMap.get(id) ?? null; }
  async enregistrer(u: Utilisateur) { this.parIdMap.set(u.id, u); }
}
