import { randomUUID } from "node:crypto";
import type { GenerateurId, Horloge, PolitiqueRoles } from "../../application/ports";

export class HorlogeSysteme implements Horloge {
  maintenant() { return new Date(); }
}

export class GenerateurUuid implements GenerateurId {
  nouveau() { return randomUUID(); }
}

// Les adresses listées dans ROLES_ADMIN reçoivent le rôle admin à l'inscription.
export class RolesParConfiguration implements PolitiqueRoles {
  private admins: Set<string>;
  constructor(liste = "") {
    this.admins = new Set(liste.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
  }
  roleInitial(email: string) {
    return this.admins.has(email) ? "admin" : "membre";
  }
}
