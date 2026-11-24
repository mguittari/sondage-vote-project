# Starter TypeScript - projet fil rouge

Point de départ du projet : deux microservices (`auth-service`, `metier-service`), PostgreSQL,
RabbitMQ et Redis sous Docker Compose. Renommez `metier-service` d'après votre sujet (dossier,
`package.json`, `compose.yaml`).

## Prérequis

Node.js 22, Docker et Docker Compose, Git ; la chaîne d'outils du langage de votre service métier.

## Démarrer

```bash
git init && git add -A && git commit -m "chore: starter"
(cd auth-service && npm install)
(cd metier-service && npm install)
docker compose up -d --build
curl http://localhost:3000/sante          # {"statut":"ok"}
open http://localhost:3000/docs           # Swagger UI du contrat openapi.yaml
```

## Commandes (dans chaque service)

| Commande | Rôle |
|---|---|
| `npm test` | tests unitaires et HTTP (sans base de données) |
| `npm run test:integration` | tests des adapters contre PostgreSQL, RabbitMQ et Redis (`docker compose up -d postgres rabbitmq redis`) |
| `npm run test:architecture` | vérifie la règle de dépendance entre couches (dependency-cruiser) |
| `npm run lint:contrat` | vérifie le contrat OpenAPI (Redocly) |
| `npm run typecheck` | vérification des types TypeScript |
| `npm run dev` | lance le service en local avec rechargement automatique |

## Organisation du code

```
<service>/src/
  domain/          entités, value objects, erreurs métier : aucun import technique
  application/     cas d'usage et ports (interfaces) dont ils ont besoin
  infrastructure/  adapters : implémentations des ports (HTTP, PostgreSQL, RabbitMQ, Redis...)
  main.ts          composition root : crée les adapters et les injecte
<service>/test/
  unit/            domaine et cas d'usage, avec doublures (unit/doublures.ts)
  http/            adapter HTTP via app.inject(), sans base
  integration/     adapters contre les vrais PostgreSQL, RabbitMQ et Redis
```

Les dépendances vont de `infrastructure` vers `application` vers `domain`, jamais l'inverse.

## Système polyglotte et contrat d'intégration

Votre système compte **au moins deux langages**. `auth-service` reste en TypeScript (celui de ce
starter) ; le service métier et le worker sont dans le langage de votre choix, validé en
séance 1 ; si le service métier est aussi en TypeScript, le worker est dans un autre langage. Les services ne partagent que des contrats : HTTP décrit par OpenAPI, JWT (JSON Web
Token) vérifié par JWKS (JSON Web Key Set), événements RabbitMQ décrits par un schéma JSON.

Un service, quel que soit son langage, s'intègre au système s'il respecte ce contrat :

| Élément | Valeur dans `compose.yaml` | À partir de |
|---|---|---|
| Image | construite par le `Dockerfile` du dossier du service | TP-02 |
| Port | écoute sur `3000` dans le conteneur ; `GET /sante` répond `200` | TP-02 |
| `DATABASE_URL` | `postgres://app:app@postgres:5432/metier` (schéma : `db/schema.sql`) | TP-02 |
| `JWKS_URL`, `JWT_ISSUER`, `JWT_AUDIENCE` | `http://auth-service:3001/.well-known/jwks.json`, émetteur et audience choisis au TP-04 | TP-04 |
| `AMQP_URL` | `amqp://guest:guest@rabbitmq:5672/` | TP-05 |
| `REDIS_URL` | `redis://redis:6379` | TP-06 |

Pour écrire le service métier dans un autre langage : remplacez le contenu du dossier
`metier-service` par votre projet (avec son `Dockerfile`), gardez les variables
ci-dessus (et le nom du service dans `compose.yaml`, s'il est renommé). Vous fournissez vous-mêmes l'outillage équivalent
de votre langage : tests unitaires, test automatisé de la règle de dépendance, validation
par schémas, bibliothèque JWT capable de lire un JWKS, client PostgreSQL, client RabbitMQ,
client Redis. Le lint du contrat OpenAPI reste celui de ce starter
(`npx @redocly/cli lint`, ou l'image Docker `redocly/cli`).

Le `metier-service` de ce starter sert aux binômes dont le service métier est en TypeScript, avec
l'`auth-service` de ce starter ou de l'autre : les deux starters ont les mêmes services, les
mêmes variables et le même `compose.yaml`.

## État fourni

- `metier-service` : couches vides, route `/sante`, contrat OpenAPI minimal, outillage complet.
- `auth-service` : inscription (`POST /auth/inscription`), mots de passe hachés en Argon2id,
  erreurs au format Problem Details. Connexion, jetons et refresh tokens sont à construire.
- `docs/adr/gabarit.md` : modèle pour vos ADR (Architecture Decision Records).
- `IA.md` : déclaration d'usage des assistants d'IA (intelligence artificielle), à tenir à jour.

Après toute modification d'un fichier `db/schema.sql` : `docker compose down -v && docker compose up -d`.
