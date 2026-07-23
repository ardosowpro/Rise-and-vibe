// Configuration du site Rise and Vibe
export const config = {
  studioName: "Rise and Vibe",
  tagline: "Le studio où ta voix prend forme.",
  whatsappNumber: "221772023888",
  address: "Dakar, Sénégal",
  mapsUrl: "https://maps.google.com/?q=Dakar+Senegal",
  hours: {
    open: "10:00",
    close: "22:00",
    days: "Lundi au Samedi",
  },
  currency: "FCFA",
  minDurationHours: 2,
  voicePromo: {
    prices: {
      1: 15000,
      2: 20000,
    },
    maxSons: 2,
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
  ],
  equipment: [
    "Cabine de prise traitée acoustiquement",
    "Micro à condensateur professionnel",
    "Préampli & interface audio haut de gamme",
    "Monitoring de studio calibré",
    "Casques de référence",
    "Stations FL Studio & Pro Tools",
  ],
  socials: {
    instagram: "#",
    tiktok: "#",
    youtube: "#",
  },
  agendaCode: "patiakh",
};

export default config;
