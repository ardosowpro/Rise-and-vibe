// Configuration du site Rise and Vibe
export const config = {
  studioName: "Rise and Vibe",
  tagline: "Le studio où ta voix prend forme.",
  whatsappNumber: "221772023888",
  address: "Dakar, Sénégal",
  mapsUrl: "https://www.google.com/maps?q=14.756045,-17.250761",
  hours: {
    open: "10:00",
    close: "22:00",
    days: "Lundi au Samedi",
  },
  currency: "FCFA",
  minDurationHours: 2,
  // Grille tarifaire : promo active jusqu'à promoEndDate inclus (bascule auto le lendemain).
  // Pour couper la promo avant la date : promoActive: false. Pour prolonger : changer promoEndDate.
  pricing: {
    promoActive: true,
    promoEndDate: "2026-08-20",
    promo: {
      label: "Période promo",
      note: "Promo applicable à partir de deux sons",
      endLabel: "Jusqu'au 20 août",
      packages: [
        { id: "2sons", label: "Deux sons", price: 20000 },
        { id: "3sons", label: "Trois sons", price: 40000 },
        { id: "ep5", label: "EP 5 titres", price: 65000 },
      ],
      hourlyRate: 15000,
    },
    horsPromo: {
      label: "Tarifs standards",
      packages: [
        { id: "1son", label: "Un son", price: 15000 },
        { id: "2sons", label: "Deux sons", price: 30000 },
        { id: "3sons", label: "Trois sons", price: 45000 },
        { id: "ep5", label: "EP 5 titres", price: 125000 },
      ],
      hourlyRate: 20000,
    },
    surDevis: [
      "Projet (plus de 5 titres)",
      "Composition",
      "Mixage",
      "Mastering",
      "Direction artistique",
    ],
  },
  services: [
    {
      id: "recording",
      label: "Enregistrement / Prise de voix",
      short: "Prise de voix",
      pricing: "sons",
      description: "Cabine traitée, préampli et micro pro pour capter ta voix.",
    },
    {
      id: "mix",
      label: "Mixage",
      short: "Mixage",
      pricing: "quote",
      description: "Équilibre, profondeur et énergie sur ton morceau.",
    },
    {
      id: "mastering",
      label: "Mastering",
      short: "Mastering",
      pricing: "quote",
      description: "La finition finale, prête pour toutes les plateformes.",
    },
  ],
  // Clients / partenaires - section « Ils nous ont fait confiance ».
  // Dépose les logos dans public/logos/ ; sans image, un badge texte est affiché.
  // Galerie de la page Studio : nombre de photos affichées avant le bouton « Voir plus »
  // (mettre un grand nombre, ex. 99, pour tout afficher d'office)
  galleryPreviewCount: 6,
  clients: [
    {
      id: "lspf",
      name: "Ligue Sénégalaise Professionnelle de Football",
      logo: "/logos/lspf.png",
    },
    { id: "dolima", name: "Dolima", logo: "/logos/dolima.png" },
    { id: "g3c", name: "G3C", country: "Italie", logo: "/logos/g3c.png" },
    { id: "ker", name: "Kër Imagination", logo: "/logos/ker-imagination.png" },
  ],
  masterclasses: [],
  sessions: [],
  team: [
    { id: "1da", name: "1DA Beatz", role: "Ingénieur du son & fondateur" },
    { id: "aziz", name: "Azizson", role: "Ingénieur mix / mastering" },
  ],
  studioPhotos: [
    "/photos/studio-1.jpg",
    "/photos/studio-2.jpg",
    "/photos/studio-3.jpg",
    "/photos/studio-4.jpg",
    "/photos/studio-5.jpg",
    "/photos/studio-6.jpg",
    "/photos/studio-7.jpg",
    "/photos/studio-8.jpg",
    "/photos/studio-9.jpg",
    "/photos/studio-10.jpg",
    "/photos/studio-11.jpg",
    "/photos/studio-12.jpg",
    "/photos/studio-13.jpg",
    "/photos/studio-14.jpg",
    "/photos/studio-16.jpg",
    "/photos/studio-17.jpg",
    "/photos/studio-18.jpg",
    "/photos/studio-19.jpg",
    "/photos/studio-20.jpg",
    "/photos/studio-21.jpg",
    "/photos/studio-22.jpg",
    "/photos/studio-23.jpg",
    "/photos/studio-24.jpg",
  ],
  equipment: {
    daw: ["Logic Pro", "FL Studio"],
    hardware: [
      "Carte son Universal Audio Apollo Twin X",
      "Micro Neumann TLM 102",
    ],
    plugins: ["Waves", "UAD", "FabFilter"],
  },
  socials: {
    instagram: "https://www.instagram.com/riseandvibestudio/",
    tiktok: "#",
    youtube: "#",
  },
};

export default config;
