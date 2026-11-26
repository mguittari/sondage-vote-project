import { Email, EmailDejaUtilise, type Utilisateur } from "../domain/modele";
import type { GenerateurId, HacheurMotDePasse, PolitiqueRoles, UtilisateurRepository } from "./ports";

export class Inscrire {
  constructor(
    private utilisateurs: UtilisateurRepository,
    private hacheur: HacheurMotDePasse,
    private ids: GenerateurId,
    private roles: PolitiqueRoles,
  ) {}

  async executer(c: { email: string; motDePasse: string }): Promise<Utilisateur> {
    const email = Email.de(c.email);
    if (await this.utilisateurs.parEmail(email.valeur)) throw new EmailDejaUtilise();
    const utilisateur: Utilisateur = {
      id: this.ids.nouveau(),
      email,
      hashMotDePasse: await this.hacheur.hacher(c.motDePasse),
      role: this.roles.roleInitial(email.valeur),
    };
    await this.utilisateurs.enregistrer(utilisateur);
    return utilisateur;
  }
}
