import type { Pool } from "pg";
import type { UtilisateurRepository } from "../../application/ports";
import { Email, type Role, type Utilisateur } from "../../domain/modele";

export class UtilisateurRepositoryPostgres implements UtilisateurRepository {
  constructor(private pool: Pool) {}

  async parEmail(email: string) { return this.un("email = $1", email); }
  async parId(id: string) { return this.un("id = $1", id); }

  async enregistrer(u: Utilisateur) {
    await this.pool.query(
      `INSERT INTO utilisateurs (id, email, hash_mot_de_passe, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = $2, hash_mot_de_passe = $3, role = $4`,
      [u.id, u.email.valeur, u.hashMotDePasse, u.role],
    );
  }

  private async un(condition: string, valeur: string): Promise<Utilisateur | null> {
    const { rows } = await this.pool.query(`SELECT * FROM utilisateurs WHERE ${condition}`, [valeur]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return { id: r.id, email: Email.de(r.email), hashMotDePasse: r.hash_mot_de_passe, role: r.role as Role };
  }
}
