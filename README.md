# Rise and Vibe — Studio d'enregistrement à Dakar

Site web de Rise and Vibe, accessible en production sur [riseandvibe.didasco.co](https://riseandvibe.didasco.co).

## Structure

- `site/` — le site déployé (build React/Vite avec PWA), servi par nginx depuis `/root/apps/riseandvibe-didasco/site` sur le serveur de production.

## Branches

- `main` — la version en production. Ce qui est sur cette branche correspond à ce qui est en ligne.
- `dev` — l'environnement de développement/test. Toutes les modifications se font ici d'abord, puis sont fusionnées dans `main` une fois validées.

## Workflow de déploiement

1. Développer et tester sur la branche `dev`.
2. Valider les changements.
3. Fusionner `dev` dans `main` : `git checkout main && git merge dev`.
4. Sur le serveur de production : `git pull` dans `/root/apps/riseandvibe-didasco`.
