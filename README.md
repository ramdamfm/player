# Player radio RAMDAM

Player web du flux live [RAMDAM](https://ramdam.fm). Vue 3 + Vite (JavaScript), servi par Nginx dans un conteneur Docker.

Le navigateur lit le MP3 AzuraCast en direct. Nginx reverse-proxy le nowplaying et la recherche de pochette iTunes (même origine, pas de CORS côté client).

## Prérequis

- Node.js 22+
- [pnpm](https://pnpm.io) 10+ (`corepack enable` suffit)
- Docker et Docker Compose pour la production

## Développement

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm dev
```

Ouvre `http://localhost:5173`. Vite reverse-proxy `/api/nowplaying` vers AzuraCast et `/api/cover` vers iTunes.

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | Serveur Vite |
| `pnpm build` | Build de production (`apps/web/dist`) |
| `pnpm preview` | Sert le build localement |

## Production (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Le player est servi en HTTP sur `http://localhost` (port hôte `DOCKER_PORT`, 80 par défaut → 8080 dans le conteneur).

Place un reverse proxy TLS (Caddy, Traefik, Nginx) devant le conteneur en production. Ne pas exposer le port 80 tel quel sur Internet.

## Configuration

Les variables `VITE_*` sont interpolées **au build**. Copier `apps/web/.env.example` vers `apps/web/.env` en local. L’image Docker utilise l’exemple versionné, jamais un `.env` local.

Le port publié par Docker Compose se définit à la racine du dépôt (`cp .env.example .env`). Docker Compose lit ce fichier pour interpoler `docker-compose.yml`.

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `DOCKER_PORT` | `80` | Port hôte publié (`hôte:8080` dans le conteneur) |
| `VITE_STREAM_URL` | `https://azuracast.ramdam.fm/listen/ramdam/feed.mp3` | Flux MP3 |
| `VITE_NOWPLAYING_URL` | `/api/nowplaying/ramdam` | Métadonnées (via proxy) |
| `VITE_WS_URL` | `wss://azuracast.ramdam.fm/api/live/nowplaying/websocket` | Nowplaying temps réel |
| `VITE_STATION` | `ramdam` | Identifiant station AzuraCast |

Si tu changes l’hôte AzuraCast, mets aussi à jour `media-src` et `connect-src` dans `nginx.conf`.

## Polices et logo

- **IBM Plex Mono / Sans** : chargés via Fontsource.
- **EP Boxi** (wordmark) : `EPBoxi-Bi` et `EPBoxi-Bold` dans `apps/web/public/fonts/`. Fallback IBM Plex Sans si les fichiers sont absents.
- **Logo radio** : `apps/web/public/logo.png` (favicon / identité ; pas de fallback pochette).

## Architecture

```
apps/web/                 Player Vue
  src/components/         Wordmark, Live, Cover, TrackInfo, Controls
  src/composables/        Audio, nowplaying, pochettes
  public/                 Logo, icônes, polices
Dockerfile                Build Vite → Nginx (utilisateur non root, port 8080)
nginx.conf                Fichiers statiques, proxy API, en-têtes de sécurité
```

## Sécurité

- Pas de secrets dans le dépôt : `.env` est ignoré, l’image Docker part de `.env.example`.
- Nginx : `server_tokens off`, CSP, `nosniff`, limitation de débit sur les proxies API, filesystem en lecture seule.
- Les pochettes ne s’affichent que depuis `*.mzstatic.com` en HTTPS.
- L’autoplay peut être bloqué par le navigateur : le flux démarre au premier geste.

Pour signaler une faille, contacte l’équipe RAMDAM plutôt que d’ouvrir une issue publique détaillée.

## Licence

© RAMDAM. Tous droits réservés. Voir `LICENSE`.
