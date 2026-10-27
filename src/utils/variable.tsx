
import * as yup from "yup";
import { PAYS } from "../assets/json/All countries";


export const COUNT = 10;
export const PAGE = 1;
export const BASE_URL = import.meta.env.VITE_BASE_URL;
// En dev, l'API est jointe via le proxy Vite (voir vite.config.ts) pour éviter le CORS
export const API_URL = import.meta.env.DEV ? '/' : BASE_URL;

// Animation.js

export const cardVariants = {
  offscreen: {
    x: -50,
    opacity: 0,
  },
  onscreen: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 10,
      duration: 0.8,
    },
  },
};

export const cardVariantYs = {
  offscreen: {
    y: 100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 1,
    },
  },
};

export const specialPaths = [
  "/about",
  "/service",
  "/nosrealisation",
  "/contactus",
  "/etppentreprise",
  "/social",
  "/envirronement",
  "/autre",
  "/detailproject",
  "/maintenance",
];








export const schemaAddproduit = yup.object().shape({
  designation: yup.string().required("La désignation est requise"),
  prix: yup
    .number()
    .typeError("Le prix doit être un nombre")
    .positive("Le prix doit être positif")
    .required("Le prix est requis"),
  qte: yup
    .number()
    .typeError("La quantité doit être un nombre")
    .integer("La quantité doit être un entier")
    .positive("La quantité doit être au moins 1")
    .required("La quantité est requise"),
  unite: yup.string().required("L'unité est requise"),
  img: yup.mixed()
    .test("fileSize", "L'image est trop grande (max 2MB)", (value: any) => {
      return value && value[0] ? value[0].size <= 2097152 : true;
    })
    .test("fileType", "Le type de fichier est invalide", (value: any) => {
      return value && value[0] ? ["image/jpeg", "image/png", "image/gif"].includes(value[0].type) : true;
    }),

  categorie_id: yup.number().required("La categorie est requise"),

});


export const schemaAddCategorie = yup.object().shape({
  designation: yup.string()
    .min(2, "La désignation doit contenir au moins 2 caractères")
    .max(50, "La désignation ne doit pas dépasser 50 caractères")
    .required("La désignation est requise"),

  img: yup.mixed()
    .test("fileSize", "L'image est trop grande (max 2MB)", (value: any) => {
      return value && value[0] ? value[0].size <= 2097152 : true;
    })
    .test("fileType", "Le type de fichier est invalide", (value: any) => {
      return value && value[0] ? ["image/jpeg", "image/png", "image/gif"].includes(value[0].type) : true;
    })
});







export const uniteOptions = [
  { value: 'Kg', label: 'Kg' },
  { value: 'L', label: 'Litre' },
  { value: 'Unite', label: 'Unite' },
];

export const paysOptions = PAYS.map((pays) => ({
  value: pays.alpha3Code,
  label: pays.name,
}));

export const civiliteOptions = [
  { value: 1, label: "Monsieur" },
  { value: 0, label: "Madame" },
];



export const deliveryZones = [
  { value: 1000, label: "Cité Keur Gorgui, Mermoz: 1,000CFA" },
  { value: 1500, label: "Dakar Plateau, Fann Hock/Residence, Point E J: 1,500CFA" },
  { value: 1500, label: "VDN, Ouakam, Liberté, Corniche, Dieupeul - Derklé: 1,500CFA" },
  { value: 1500, label: "Medina, Scat Urbam, Colobane, Sacré Coeur, Sicap: 1,500CFA" },
  { value: 2000, label: "Ouest Foire, Nord Foire, HLM, Parcelles, Grand Dakar, Yoff, Almadies: 2,000CFA" },
  { value: 2500, label: "Dakar Banlieue, Fadia, Golf, Pikine, Guediawaye: 2,500CFA" },
  { value: 3500, label: "Diamaguene, Keur Massar, Mbaye: 3,500CFA" },
  { value: 5000, label: "Rufisque, Diamniadio: 5,000CFA" },
  { value: 6500, label: "Thies - Tivaouane: 6,500CFA" },
  { value: 10000, label: "Saint Louis -Kaolack - Fatick - Diourbel - Bambey: 10,000CFA" },
  { value: 12000, label: "Ziguinchor - Matam - Kaffrine - Podor: 12,000CFA" },
];










export const campaigns = [
  {
    id: 1,
    titre: "Campagne de sensibilisation au dépistage du cancer",
    image: "",
    publishedDate: "19 juin 2025",
    deadline: "5 Juillet 2025",
    status: "en cours",
    description: "SALAMA mène régulièrement des campagnes pour promouvoir l’accès équitable aux médicaments, sensibiliser les acteurs de santé et informer le public sur ses actions."
  },
  {
    id: 2,
    titre: "Campagne nationale de déparasitage scolaire",
    image: "",
    publishedDate: "16 juin 2025",
    deadline: "10 Juillet 2025",
    status: "en cours",
    description: "Chaque action vise un seul objectif : garantir à toutes les populations un accès équitable à des médicaments de qualité."
  }
];
