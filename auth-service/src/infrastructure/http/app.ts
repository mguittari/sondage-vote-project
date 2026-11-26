import Fastify, { type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { Inscrire } from "../../application/cas-usage";
import { EmailDejaUtilise, EmailInvalide, ErreurAuth } from "../../domain/modele";

export interface CasUsageAuth {
  inscrire: Inscrire;
}

const Identifiants = z.object({
  email: z.string().trim().min(3).max(254),
  motDePasse: z.string().min(12).max(128),
});

const TYPE_BASE = "https://exemple.fr/problemes/";
const STATUTS = new Map<Function, number>([
  [EmailInvalide, 422],
  [EmailDejaUtilise, 409],
]);
const CONTRAT = fileURLToPath(new URL("../../../openapi.yaml", import.meta.url));

class EntreeInvalide extends Error {
  constructor(readonly erreurs: { champ: string; message: string }[]) { super("Entrée invalide"); }
}

function valider<T>(schema: z.ZodType<T>, donnees: unknown): T {
  const r = schema.safeParse(donnees);
  if (!r.success) throw new EntreeInvalide(r.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })));
  return r.data;
}

export async function construireApp(cas: CasUsageAuth): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  await app.register(swagger, { mode: "static", specification: { path: CONTRAT, baseDir: "" } });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  // Erreurs au format Problem Details (RFC 9457).
  app.setErrorHandler((erreur: Error & { statusCode?: number }, req, reply) => {
    const probleme =
      erreur instanceof EntreeInvalide
        ? { type: `${TYPE_BASE}entree-invalide`, title: erreur.message, status: 400, erreurs: erreur.erreurs }
        : erreur instanceof ErreurAuth
          ? { type: TYPE_BASE + erreur.code, title: erreur.message, status: STATUTS.get(erreur.constructor) ?? 400 }
          : erreur.statusCode && erreur.statusCode < 500
            ? { type: `${TYPE_BASE}requete-invalide`, title: erreur.message, status: erreur.statusCode }
            : (req.log.error(erreur), { type: `${TYPE_BASE}erreur-interne`, title: "Erreur interne", status: 500 });
    return reply.code(probleme.status).type("application/problem+json").send({ ...probleme, instance: req.url });
  });

  app.get("/sante", async () => ({ statut: "ok" }));

  app.post("/auth/inscription", async (req, reply) => {
    const u = await cas.inscrire.executer(valider(Identifiants, req.body));
    return reply.code(201).send({ id: u.id, email: u.email.valeur, role: u.role });
  });

  return app;
}
