# Rise and Vibe — Frontend

Site du studio Rise and Vibe (React + Vite + Tailwind). Toute la configuration
éditoriale se fait dans `src/config.js` et dans `public/` — pas besoin de
toucher au code des pages.

## Commandes

```bash
npm run dev      # serveur de développement
npm run build    # build de production (dist/)
npm run preview  # prévisualiser le build
npm run photos   # régénérer les photos optimisées (WebP)
```

## Tarifs et promo (`src/config.js` → `pricing`)

- `promoActive: true` + date du jour ≤ `promoEndDate` → la grille `promo` est
  affichée partout (badge « Jusqu'au 20 août », note « applicable à partir de
  deux sons »). La promo vaut **toute la journée** de `promoEndDate` et bascule
  **automatiquement** sur la grille `horsPromo` le lendemain, sans rien changer
  au code.
- Couper la promo avant la date : `promoActive: false`.
- Prolonger la promo : changer `promoEndDate` (format `AAAA-MM-JJ`) et adapter
  `promo.endLabel` (texte du badge).
- `promo` / `horsPromo` : `packages` (forfaits id/label/price) et `hourlyRate`
  (tarif horaire). Les montants sont en FCFA, formatés automatiquement.
- `surDevis` : liste des prestations sans prix (demande de devis WhatsApp
  uniquement, pas d'enregistrement dans l'agenda).
- La grille active est calculée par `src/lib/pricing.js` (`getActivePricing()`),
  utilisée par l'accueil, la page `/tarifs` et le formulaire `/reserver`.

## Logos clients (« Ils nous ont fait confiance »)

- Liste dans `src/config.js` → `clients` : `{ id, name, logo, country? }`.
- Déposer les images dans `public/logos/` (PNG/SVG, fond transparent de
  préférence). Elles sont affichées en monochrome clair, couleur au survol.
- Si l'image est absente ou ne charge pas, un badge texte avec le nom complet
  est affiché automatiquement — on peut donc ajouter un client sans logo.

## Photos du studio et diaporama du héro

- Liste dans `src/config.js` → `studioPhotos` (fichiers dans `public/photos/`).
- Ces photos alimentent le diaporama de l'accueil et la galerie de la page
  Studio.
- Après ajout d'une photo, lancer `npm run photos` pour générer la version
  WebP optimisée (`public/photos/optimized/*.webp`, max 1600 px). Le site
  utilise le WebP avec repli automatique sur le JPG d'origine.
- Accessibilité : le diaporama est décoratif (`aria-hidden`) et affiche une
  image fixe si l'utilisateur préfère réduire les animations.

## Matériel du studio

`src/config.js` → `equipment`, en trois groupes affichés sur la page Studio :

```js
equipment: {
  daw: [...],      // Logiciels
  hardware: [...], // Matériel
  plugins: [...],  // Plugins
}
```

## Réservations

- Les forfaits et sessions à l'heure sont enregistrés via l'API locale
  (`POST /api/reservations`, voir `src/lib/reservations.js`) puis un message
  WhatsApp pré-rempli est ouvert (numéro : `config.whatsappNumber`).
- Le choix de l'ingénieur (depuis `config.team`) est inclus dans le message
  WhatsApp et dans le champ `note` de l'API.
- Les demandes « sur devis » passent uniquement par WhatsApp (pas d'appel API).
- L'agenda ingénieurs est sur `/agenda` (code : `config.agendaCode`).
