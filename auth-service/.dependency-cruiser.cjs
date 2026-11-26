// Tests d'architecture : la règle de dépendance de la Clean Architecture, vérifiée à chaque exécution.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domaine-pur",
      comment: "Le domaine ne dépend ni de l'application, ni de l'infrastructure, ni d'aucun paquet externe.",
      severity: "error",
      from: { path: "^src/domain" },
      to: { pathNot: "^src/domain" },
    },
    {
      name: "application-sans-infrastructure",
      comment: "Les cas d'usage ne connaissent que le domaine et leurs ports.",
      severity: "error",
      from: { path: "^src/application" },
      to: { path: ["^src/infrastructure", "^src/main", "^src/worker"] },
    },
    {
      name: "application-sans-framework",
      comment: "Aucun framework, client réseau ou driver dans les cas d'usage.",
      severity: "error",
      from: { path: "^src/application" },
      to: { dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "core"] },
    },
    {
      name: "pas-de-cycle",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
