// Domaine de l'authentification.

export abstract class ErreurAuth extends Error {
  abstract readonly code: string;
}

export class EmailInvalide extends ErreurAuth {
  readonly code = "email-invalide";
  constructor(valeur: string) { super(`Adresse e-mail invalide : ${valeur}`); }
}

export class EmailDejaUtilise extends ErreurAuth {
  readonly code = "email-deja-utilise";
  constructor() { super("Adresse e-mail déjà utilisée"); }
}

// Rôles à adapter au sujet (ex. "membre" | "organisateur").
export type Role = "membre" | "admin";

export class Email {
  private constructor(readonly valeur: string) {}
  static de(brut: string): Email {
    const v = brut.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new EmailInvalide(brut);
    return new Email(v);
  }
}

export interface Utilisateur {
  readonly id: string;
  readonly email: Email;
  readonly hashMotDePasse: string;
  readonly role: Role;
}
