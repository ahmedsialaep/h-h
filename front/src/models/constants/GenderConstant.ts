import { Categorie, Genre } from "@/models/Product";

export const GENDER_SLUG_MAP: Record<string, Genre> = {
  homme: Genre.MALE,
  femme: Genre.FEMALE,
  enfant: Genre.KIDS,
};

export const GENDER_SLUG_REVERSE: Record<Genre, string> = {
  [Genre.MALE]: "homme",
  [Genre.FEMALE]: "femme",
  [Genre.KIDS]: "enfant",
};

export const GENRE_LABELS: Record<Genre, string> = {
  [Genre.MALE]: "Homme",
  [Genre.FEMALE]: "Femme",
  [Genre.KIDS]: "Enfants",
};

export const CATEGORIE_LABELS: Record<Categorie, string> = {
  [Categorie.BASKETBALL]: "Basketball",
  [Categorie.FOOTBALL]: "Football",
  [Categorie.RUNNING]: "Running",
  [Categorie.LIFESTYLE]: "Lifestyle",
};

export const GENDER_CONTENT: Record<Genre, any> = {
  [Genre.MALE]: {
    title: "COLLECTION HOMME",
    subtitle: "Performance & Style",
    description: "Des sneakers pensées pour l'homme moderne. Performance sportive et style urbain réunis.",
  },
  [Genre.FEMALE]: {
    title: "COLLECTION FEMME",
    subtitle: "Élégance & Performance",
    description: "Des sneakers conçues pour les femmes actives. Alliant confort, performance et design tendance.",
  },
  [Genre.KIDS]: {
    title: "COLLECTION ENFANT",
    subtitle: "Confort & Durabilité",
    description: "Des sneakers robustes et confortables pour les petits champions. Conçues pour résister à toutes les aventures.",
  },
};