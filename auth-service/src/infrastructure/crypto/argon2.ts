import { hash, verify } from "@node-rs/argon2";
import type { HacheurMotDePasse } from "../../application/ports";

// Argon2id, paramètres par défaut de la bibliothèque (m=19456 Kio, t=2, p=1 : recommandation OWASP).
export class HacheurArgon2 implements HacheurMotDePasse {
  hacher(motDePasse: string) { return hash(motDePasse); }
  verifier(h: string, motDePasse: string) { return verify(h, motDePasse); }
}
