import { construireApp } from "./infrastructure/http/app";

// Composition root : le seul endroit qui crée les implémentations concrètes (pool PostgreSQL,
// client Redis, adapters) et les injecte dans les cas d'usage, puis dans l'adapter HTTP.
const app = await construireApp();

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
