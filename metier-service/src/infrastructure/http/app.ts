import Fastify, { type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { fileURLToPath } from "node:url";

const CONTRAT = fileURLToPath(new URL("../../../openapi.yaml", import.meta.url));

// Adapter HTTP entrant : il traduit HTTP <-> cas d'usage, rien de plus.
// Les cas d'usage lui seront passés en paramètre par la composition root (main.ts).
export async function construireApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  await app.register(swagger, { mode: "static", specification: { path: CONTRAT, baseDir: "" } });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/sante", async () => ({ statut: "ok" }));

  return app;
}
