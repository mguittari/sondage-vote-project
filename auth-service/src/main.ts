import pg from "pg";
import { Inscrire } from "./application/cas-usage";
import { HacheurArgon2 } from "./infrastructure/crypto/argon2";
import { construireApp } from "./infrastructure/http/app";
import { UtilisateurRepositoryPostgres } from "./infrastructure/postgres/repositories-postgres";
import { GenerateurUuid, RolesParConfiguration } from "./infrastructure/systeme/systeme";

// Composition root du service d'authentification.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const utilisateurs = new UtilisateurRepositoryPostgres(pool);

const app = await construireApp({
  inscrire: new Inscrire(utilisateurs, new HacheurArgon2(), new GenerateurUuid(), new RolesParConfiguration(process.env.ROLES_ADMIN)),
});

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3001) });
