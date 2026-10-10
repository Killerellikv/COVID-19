# Permis B Belgique

Application web d'entraînement à l'examen théorique du permis B en Belgique. Elle s'installe sur téléphone ou ordinateur (PWA) et fonctionne hors connexion.

- **Examen blanc** : 50 questions tirées dans tous les thèmes, temps limité par question (15 s, 30 s ou sans limite). Il faut 41/50 pour réussir, une erreur coûte 1 point et une faute grave 5 points.
- **Entraînement par thème** (13 thèmes) et **entraînement rapide** (20 questions), avec la correction expliquée après chaque réponse.
- **Révision des erreurs** : une question ratée reste dans la liste jusqu'à ce que vous y répondiez correctement.
- Panneaux, feux, agents, carrefours vus du dessus et marquages sont dessinés en SVG.
- La progression reste sur l'appareil (`localStorage`). Il n'y a ni compte ni serveur.

Les 236 questions sont originales et ont été rédigées d'après le code de la route belge (AR du 1er décembre 1975). Ce n'est pas la banque officielle des centres d'examen.

## Démarrer en local

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run dev          # http://localhost:8787
```

En local, le service worker (le cache hors connexion) est désactivé pour que vos modifications s'affichent tout de suite. Pour tester le mode hors connexion et l'installation, ouvrez http://localhost:8787/?sw=1.

```bash
npm test             # vérifie la banque de questions et le service worker
```

## Mettre en ligne sur Cloudflare

L'application est un Worker Cloudflare qui ne sert que des fichiers statiques : aucun code serveur, pas de base de données. Elle tient dans l'offre gratuite.

1. Connectez-vous au compte Cloudflare que vous utilisez déjà. Si `wrangler` est déjà connecté sur votre machine, passez cette étape.
   ```bash
   npx wrangler login
   npm run whoami      # affiche le compte utilisé
   ```
2. Déployez :
   ```bash
   npm run deploy
   ```
   La commande met à jour la version du cache, lance les vérifications puis envoie le dossier `public/`. L'application est ensuite disponible sur `https://permis-b-belgique.<votre-sous-domaine>.workers.dev`.

À chaque nouveau `npm run deploy`, les personnes qui ont déjà l'application voient le message « Une nouvelle version est disponible » et peuvent mettre à jour en un clic.

Si votre utilisateur a accès à plusieurs comptes Cloudflare, ajoutez `"account_id": "…"` dans `wrangler.jsonc`, ou définissez la variable `CLOUDFLARE_ACCOUNT_ID`.

**Nom de domaine.** Pour utiliser votre propre domaine, ajoutez-le dans le tableau de bord Cloudflare (Workers & Pages → permis-b-belgique → Settings → Domains & Routes), ou dans `wrangler.jsonc` :

```jsonc
"routes": [{ "pattern": "permis.example.be", "custom_domain": true }]
```

**Cloudflare Pages.** Si vous préférez un projet Pages, utilisez `npm run deploy:pages`. Il crée le projet `permis-b-belgique` au premier envoi.

## Organisation

```
public/                  fichiers servis tels quels
  index.html             la page de l'application
  css/app.css            styles (thème clair et sombre)
  js/questions.js        banque de questions et thèmes
  js/illustrations.js    panneaux, feux, carrefours, marquages (SVG)
  js/app.js              logique : examen, entraînement, résultats, progression
  js/pwa.js              installation, service worker, mises à jour
  sw.js                  service worker (VERSION et PRECACHE sont générés)
  manifest.webmanifest   nom, icônes et raccourcis de l'application installée
  _headers               en-têtes HTTP (sécurité, cache)
  fonts/ icons/ screenshots/
scripts/
  check-questions.mjs    vérification de la banque de questions (npm test)
  stamp-sw.mjs           version et liste des fichiers du cache (npm run build)
wrangler.jsonc           configuration Cloudflare
```

## Ajouter ou corriger une question

Ajoutez une entrée au tableau `QUESTIONS` dans `public/js/questions.js` :

```js
{t:"vitesse", q:"Question ?", a:["Bonne réponse","Autre","Autre"], r:0, g:1, e:"Explication.", i:{s:"C43", v:"50"}}
```

- `t` : thème (`id` d'un élément de `THEMES`).
- `a` : 2 ou 3 réponses. `r` : position de la bonne réponse, en partant de 0. L'ordre est mélangé à l'affichage, sauf pour les réponses chiffrées (à écrire dans l'ordre croissant) et pour les réponses Oui/Non.
- `g:1` : faute grave (−5 points à l'examen blanc).
- `e` : explication affichée après la réponse.
- `i` (facultatif) : illustration. `s` = panneau (`B1`, `B5`, `B9`, `C43` avec `v`…), `l` = feu (`red`, `orange`, `blink`, `green`, `arrow`, `pn`), `x` = carrefour, `m` = marquage, `ag` = agent (`up`, `side`).

Ensuite, lancez `npm test` puis `npm run deploy`.

## Licences

Les polices Barlow Condensed et Atkinson Hyperlegible sont distribuées sous licence SIL Open Font License 1.1 (voir `public/fonts/`).
