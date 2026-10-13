import { AO } from "../types/AO.types";

export const mockAOs: AO[] = [
  {
    id: "1",
    isnotationfournisseur: 30,
    isnotationarticle: 40,
    isnotationadministrative: 30,
    statut: 1,
    attachments:[
      { id: "1", designation: "Cahier des charges", url: "/docs/cdc-2025-001.pdf", documentspecification: { id: "1", designation: "CDC", nature:"", etatetexte: "Valide" }, isannexe:0 },
      { id: "2", designation: "Spécifications techniques", url: "/docs/spec-2025-001.pdf", documentspecification: { id: "2", designation: "Spec", nature:"", etatetexte: "Valide" }, isannexe:1 }
    ],
    date: "2025-09-01",
    datecloture: "2026-09-30",
    targetpricestatus: 0,
    etat_text: "En cours",
    etat_badge: "primary",
    reference: "AO-2025-001",
    designation: "Fourniture de matériel médical",
    TSSCOD_0_0: "MED",
    typemarche_id: "7",
    typemarche: { id: "7", designation: "Achat Direct" },
    typeprocedure_id: "1",
    typeprocedure: { id: "1", designation: "Appel d'offres ouvert" },
    datepublication: "2025-08-15",
    aoarticles: [
      {
        id: "1",
        quantite: 100,
        targetprice: 150000,
        coeff: 1.1,
        targetpricestatus: 0,
        article: {
          id: "1",
          code: "MED001",
          designation: "Échographe portable"
        }
      },
      {
        id: "2",
        quantite: 50,
        targetprice: 75000,
        coeff: 1.05,
        targetpricestatus: 0,
        article: {
          id: "2",
          code: "MED002",
          designation: "Moniteur multiparamétrique"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "1",
        fournisseur: {
          id: "1",
          nom: "MedTech Solutions",
          email: "contact@medtech.com",
          score: 85,
          telephone: "+123456789",
          adresse: "123 rue Médicale",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: [
      {
        id: "1",
        statut: 1,
        date: "2025-09-05",
        score: 82,
        isbc: 1,
        iscontrat: 0,
        ao_id: "1",
        fournisseur_id: "1",
        fournisseur: {
          id: "1",
          nom: "MedTech Solutions",
          email: "contact@medtech.com",
          score: 85,
          telephone: "+123456789",
          adresse: "123 rue Médicale",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        },
        soumissionarticles: [
          {
            id: "1",
            isselected: 1,
            resultatevaluation: "Conforme",
            prixunitairepropose: 145000,
            presenceechantillon: 1,
            presencedossierstech: 1,
            pays_id: "FR",
            observationsaq: "RAS",
            prequalification: "Qualifié",
            statutamm: "Valide",
            fabricant_id: "1",
            fabricant: { id: "1", designation: "MedTech Manufacturing" },
            article_id: "1",
            article: {
              id: "1",
              designation: "Échographe portable",
              code: "MED001",
              prix: 145000,
              quantite: 100
            },
            score: 88,
            typecondition_id: "1",
            typecondition: { id: "1", designation: "CIF" }
          }
        ]
      }
    ]
  },

  {
    id: "2",
    isnotationfournisseur: 35,
    isnotationarticle: 35,
    isnotationadministrative: 30,
    statut: 2,
  TSSCOD_0_0: "MED",
    date: "2025-09-02",
    targetpricestatus: 1,
    datecloture: "2026-10-05",
    etat_text: "En attente d'évaluation",
    etat_badge: "warning",
    reference: "AO-2025-002",
    designation: "Fourniture de médicaments essentiels",
     attachments:[
      { id: "1", designation: "Cahier des charges", url: "/docs/cdc-2025-001.pdf", documentspecification: { id: "1", designation: "CDC", nature:"", etatetexte: "Valide" }, isannexe:0 },
      { id: "2", designation: "Spécifications techniques", url: "/docs/spec-2025-001.pdf", documentspecification: { id: "2", designation: "Spec", nature:"", etatetexte: "Valide" }, isannexe:1 }
    ],
    typemarche_id: "6",
    typemarche: { id: "6", designation: "Cotation" },
    typeprocedure_id: "2",
    typeprocedure: { id: "2", designation: "Appel d'offres restreint" },
    datepublication: "2025-08-20",
    aoarticles: [
      {
        id: "3",
        quantite: 10000,
        targetprice: 500,
        coeff: 1.15,
        targetpricestatus: 1,
        article: {
          id: "3",
          code: "PHAR001",
          designation: "Paracétamol 500mg"
        }
      },
      {
        id: "4",
        quantite: 5000,
        targetprice: 1200,
        coeff: 1.1,
        targetpricestatus: 1,
        article: {
          id: "4",
          code: "PHAR002",
          designation: "Amoxicilline 250mg"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "2",
        fournisseur: {
          id: "2",
          nom: "PharmaGlobal",
          email: "contact@pharmaglobal.com",
          score: 90,
          telephone: "+987654321",
          adresse: "456 avenue Pharmaceutique",
          typefournisseur: { id: "2", designation: "Distributeur" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: []
  },

  {
    id: "11",
    isnotationfournisseur: 35,
    isnotationarticle: 40,
    isnotationadministrative: 25,
    statut: 3,
  TSSCOD_0_0: "BSER",
  targetpricestatus: 0,
    date: "2025-08-15",
    datecloture: "2026-09-25",
    etat_text: "Attribué",
    etat_badge: "success",
    reference: "AOR-2025-002",
    designation: "Consultation - Vaccins pédiatriques",
    attachments: [
      { id: "24", designation: "DAO Vaccins", url: "/docs/dao-vaccins.pdf", documentspecification: { id: "24", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "25", designation: "Certificats OMS", url: "/docs/certificats-oms.pdf", documentspecification: { id: "25", designation: "Certificat", nature:"", etatetexte: "Valide" }, isannexe: 1 },
      
      { id: "24", designation: "DAO Vaccins", url: "/docs/dao-vaccins.pdf", documentspecification: { id: "24", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "26", designation: "Certificats OMS", url: "/docs/certificats-oms.pdf", documentspecification: { id: "26", designation: "Certificat", nature:"", etatetexte: "Valide" }, isannexe: 1 },
      
      { id: "24", designation: "DAO Vaccins", url: "/docs/dao-vaccins.pdf", documentspecification: { id: "24", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "27", designation: "Certificats OMS", url: "/docs/certificats-oms.pdf", documentspecification: { id: "27", designation: "Certificat", nature:"", etatetexte: "Valide" }, isannexe: 1 },
      
      { id: "24", designation: "DAO Vaccins", url: "/docs/dao-vaccins.pdf", documentspecification: { id: "24", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "28", designation: "Certificats OMS", url: "/docs/certificats-oms.pdf", documentspecification: { id: "28", designation: "Certificat", nature:"", etatetexte: "Valide" }, isannexe: 1 },

    ],
    typemarche_id: "5",
    typemarche: { id: "5", designation: "Consultation" },
    typeprocedure_id: "4",
    typeprocedure: { id: "4", designation: "AOR" },
    datepublication: "2025-07-10",
    aoarticles: [
      {
        id: "24",
        quantite: 100000,
        targetprice: 1.8,
        targetpricestatus: 0,
        coeff: 1.15,
        article: {
          id: "24",
          code: "VAC001",
          designation: "Vaccin Pentavalent"
        }
      },
      {
        id: "25",
        quantite: 80000,
        targetprice: 2.1,
        targetpricestatus: 0,
        coeff: 1.12,
        article: {
          id: "25",
          code: "VAC002",
          designation: "Vaccin ROR"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "24",
        fournisseur: {
          id: "24",
          nom: "Vaccine World Health",
          email: "orders@vaccineworld.com",
          score: 96,
          telephone: "+41 22 123 4567",
          adresse: "Global Health Center, Genève",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: [
      {
        id: "24",
        statut: 3,
        date: "2025-08-10",
        score: 94,
        isbc: 1,
        iscontrat: 1,
        ao_id: "11",
        fournisseur_id: "24",
        fournisseur: {
          id: "24",
          nom: "Vaccine World Health",
          email: "orders@vaccineworld.com",
          score: 96,
          telephone: "+41 22 123 4567",
          adresse: "Global Health Center, Genève",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        },
        soumissionarticles: [
          {
            id: "24",
            isselected: 1,
            resultatevaluation: "Conforme - Prix compétitif",
            prixunitairepropose: 1.75,
            presenceechantillon: 1,
            presencedossierstech: 1,
            pays_id: "CH",
            observationsaq: "Certification OMS valide",
            prequalification: "Qualifié",
            statutamm: "Valide",
            fabricant_id: "24",
            fabricant: { id: "24", designation: "Vaccine World Health" },
            article_id: "24",
            article: {
              id: "24",
              designation: "Vaccin Pentavalent",
              code: "VAC001",
              prix: 1.75,
              quantite: 100000
            },
            score: 95,
            typecondition_id: "2",
            typecondition: { id: "2", designation: "CIF" }
          }
        ]
      }
    ]
  },

  // 5. AOI (Appel d'offres ouverts International) - 2 AO
  {
    id: "12",
    isnotationfournisseur: 30,
    isnotationarticle: 50,
    isnotationadministrative: 20,
  TSSCOD_0_0: "BSR",
  targetpricestatus: 1,
    statut: 1,
    date: "2025-09-20",
    datecloture: "2026-10-25",
    etat_text: "En cours",
    etat_badge: "primary",
    reference: "AOI-2025-001",
    designation: "AOR - Équipement d'imagerie médicale",
    attachments: [
      { id: "26", designation: "Dossier d'appel d'offres international", url: "/docs/dao-aoi-001.pdf", documentspecification: { id: "26", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "27", designation: "Spécifications techniques détaillées", url: "/docs/spec-aoi-001.pdf", documentspecification: { id: "27", designation: "Spec", nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "4",
    typemarche: { id: "4", designation: "AOR" },
    typeprocedure_id: "3",
    typeprocedure: { id: "3", designation: "AOI" },
    datepublication: "2025-09-01",
    aoarticles: [
      {
        id: "26",
        quantite: 3,
        targetprice: 120000,
        targetpricestatus: 0,
        coeff: 1.1,
        article: {
          id: "26",
          code: "IMG001",
          designation: "Scanner CT 64 coupes"
        }
      },
      {
        id: "27",
        quantite: 2,
        targetprice: 180000,
        targetpricestatus: 0,
        coeff: 1.05,
        article: {
          id: "27",
          code: "IMG002",
          designation: "IRM 1.5 Tesla"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "26",
        fournisseur: {
          id: "26",
          nom: "Global Medical Imaging",
          email: "tenders@globalmedical.com",
          score: 92,
          telephone: "+1 800 123 4567",
          adresse: "Medical Equipment Plaza, New York",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      },
      {
        id: "27",
        fournisseur: {
          id: "27",
          nom: "EuroMed Technologies",
          email: "procurement@euromedtech.com",
          score: 89,
          telephone: "+49 30 987 6543",
          adresse: "Technology Park, Berlin",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: []
  },
  {
    id: "13",
    isnotationfournisseur: 25,
    isnotationarticle: 55,
    isnotationadministrative: 20,
    statut: 2,
  TSSCOD_0_0: "BSER",
  targetpricestatus: 1,
    date: "2025-09-18",
    datecloture: "2026-10-15",
    etat_text: "Soumissions reçues",
    etat_badge: "info",
    reference: "AOI-2025-002",
    designation: "AOI - Ambulances aériennes",
    attachments: [
      { id: "28", designation: "DAO Ambulances aériennes", url: "/docs/dao-ambulances-air.pdf", documentspecification: { id: "28", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "29", designation: "Exigences de certification", url: "/docs/certification-air.pdf", documentspecification: { id: "29", designation: "Certification", nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "3",
    typemarche: { id: "3", designation: "AOI" },
    typeprocedure_id: "3",
    typeprocedure: { id: "3", designation: "AOI" },
    datepublication: "2025-08-25",
    aoarticles: [
      {
        id: "28",
        quantite: 2,
        targetprice: 2500000,
        targetpricestatus: 1,
        coeff: 1.0,
        article: {
          id: "28",
          code: "AIR001",
          designation: "Hélicoptère médicalisé"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "28",
        fournisseur: {
          id: "28",
          nom: "Air Medical International",
          email: "sales@airmedical.com",
          score: 90,
          telephone: "+33 1 23 45 67 89",
          adresse: "Aéroport Charles de Gaulle, Paris",
          typefournisseur: { id: "6", designation: "Spécialiste aéronautique" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: [
      {
        id: "28",
        statut: 2,
        date: "2025-09-15",
        score: 0,
        isbc: 0,
        iscontrat: 0,
        ao_id: "13",
        fournisseur_id: "28",
        fournisseur: {
          id: "28",
          nom: "Air Medical International",
          email: "sales@airmedical.com",
          score: 90,
          telephone: "+33 1 23 45 67 89",
          adresse: "Aéroport Charles de Gaulle, Paris",
          typefournisseur: { id: "6", designation: "Spécialiste aéronautique" },
          categoriefournisseur: { id: "1", designation: "A" }
        },
        soumissionarticles: [
          {
            id: "28",
            isselected: 0,
            resultatevaluation: "En évaluation technique",
            prixunitairepropose: 2450000,
            presenceechantillon: 0,
            presencedossierstech: 1,
            pays_id: "FR",
            observationsaq: "Certifications en cours de vérification",
            prequalification: "En cours",
            statutamm: "En cours",
            fabricant_id: "28",
            fabricant: { id: "28", designation: "Airbus Helicopters" },
            article_id: "28",
            article: {
              id: "28",
              designation: "Hélicoptère médicalisé",
              code: "AIR001",
              prix: 2450000,
              quantite: 2
            },
            score: 0,
            typecondition_id: "4",
            typecondition: { id: "4", designation: "FOB" }
          }
        ]
      }
    ]
  },

  // 6. AON (Appel d'offres ouverts national) - 2 AO
  {
    id: "14",
    isnotationfournisseur: 40,
    isnotationarticle: 40,
    isnotationadministrative: 20,
  TSSCOD_0_0: "BSER",
  targetpricestatus: 0,
    statut: 1,
    date: "2025-09-22",
    datecloture: "2026-10-20",
    etat_text: "En cours",
    etat_badge: "primary",
    reference: "AON-2025-001",
    designation: "AON - Mobilier hospitalier",
    attachments: [
      { id: "30", designation: "DAO Mobilier hospitalier", url: "/docs/dao-mobilier.pdf", documentspecification: { id: "30", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "31", designation: "Normes qualité", url: "/docs/normes-mobilier.pdf", documentspecification: { id: "31", designation: "Normes", nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "2 ",
    typemarche: { id: "2", designation: "Mobilier" },
    typeprocedure_id: "2",
    typeprocedure: { id: "2", designation: "AON" },
    datepublication: "2025-09-05",
    aoarticles: [
      {
        id: "30",
        quantite: 200,
        targetprice: 1200,
        targetpricestatus: 0,
        coeff: 1.1,
        article: {
          id: "30",
          code: "MOB001",
          designation: "Lit médical électrique"
        }
      },
      {
        id: "31",
        quantite: 300,
        targetprice: 450,
        targetpricestatus: 0,
        coeff: 1.15,
        article: {
          id: "31",
          code: "MOB002",
          designation: "Table de chevet médicale"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "30",
        fournisseur: {
          id: "30",
          nom: "MadaMobilier Médical",
          email: "commercial@madamobilier.mg",
          score: 85,
          telephone: "+261 20 22 678 90",
          adresse: "Zone Industrielle, Antananarivo",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "2", designation: "B" }
        }
      },
      {
        id: "31",
        fournisseur: {
          id: "31",
          nom: "Equip'Hôpital Madagascar",
          email: "ventes@equiphopital.mg",
          score: 82,
          telephone: "+261 20 22 789 01",
          adresse: "Avenue de l'Indépendance, Antananarivo",
          typefournisseur: { id: "2", designation: "Distributeur" },
          categoriefournisseur: { id: "2", designation: "B" }
        }
      }
    ],
    soumissions: []
  },
  {
    id: "15",
    isnotationfournisseur: 35,
    isnotationarticle: 45,
    isnotationadministrative: 20,
    TSSCOD_0_0: "MED",
    statut: 3,
    targetpricestatus: 0,
    date: "2025-08-30",
    datecloture: "2026-11-01",
    etat_text: "Attribué",
    etat_badge: "success",
    reference: "AON-2025-002",
    designation: "AON - Produits alimentaires pour hôpitaux",
    attachments: [
      { id: "32", designation: "DAO Produits alimentaires", url: "/docs/dao-alimentaire.pdf", documentspecification: { id: "32", designation: "DAO", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "33", designation: "Cahier des charges nutritionnel", url: "/docs/cdc-nutrition.pdf", documentspecification: { id: "33", designation: "CDC", nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "2",
    typemarche: { id: "2", designation: "AON" },
    typeprocedure_id: "2",
    typeprocedure: { id: "2", designation: "AON" },
    datepublication: "2025-08-10",
    aoarticles: [
      {
        id: "32",
        quantite: 5000,
        targetprice: 85,
        targetpricestatus: 1,
        coeff: 1.2,
        article: {
          id: "32",
          code: "ALIM001",
          designation: "Riz nutritif enrichi"
        }
      },
      {
        id: "33",
        quantite: 3000,
        targetprice: 120,
        targetpricestatus: 0,
        coeff: 1.15,
        article: {
          id: "33",
          code: "ALIM002",
          designation: "Lait thérapeutique"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "32",
        fournisseur: {
          id: "32",
          nom: "AgroNutrition Madagascar",
          email: "contact@agronutrition.mg",
          score: 87,
          telephone: "+261 20 22 890 12",
          adresse: "Route des Cultures, Antsirabe",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: [
      {
        id: "32",
        statut: 3,
        date: "2025-08-25",
        score: 89,
        isbc: 1,
        iscontrat: 1,
        ao_id: "15",
        fournisseur_id: "32",
        fournisseur: {
          id: "32",
          nom: "AgroNutrition Madagascar",
          email: "contact@agronutrition.mg",
          score: 87,
          telephone: "+261 20 22 890 12",
          adresse: "Route des Cultures, Antsirabe",
          typefournisseur: { id: "1", designation: "Fabricant" },
          categoriefournisseur: { id: "1", designation: "A" }
        },
        soumissionarticles: [
          {
            id: "32",
            isselected: 1,
            resultatevaluation: "Conforme - Qualité supérieure",
            prixunitairepropose: 8.2,
            presenceechantillon: 1,
            presencedossierstech: 1,
            pays_id: "MG",
            observationsaq: "Produit local de haute qualité",
            prequalification: "Qualifié",
            statutamm: "Valide",
            fabricant_id: "32",
            fabricant: { id: "32", designation: "AgroNutrition Madagascar" },
            article_id: "32",
            article: {
              id: "32",
              designation: "Riz nutritif enrichi",
              code: "ALIM001",
              prix: 8.2,
              quantite: 5000
            },
            score: 90,
            typecondition_id: "1",
            typecondition: { id: "1", designation: "CIF" }
          }
        ]
      }
    ]
  },

  // 7. AMI (Appel à manifestation d'intérêt) - 2 AO
  {
    id: "16",
    isnotationfournisseur: 50,
    isnotationarticle: 30,
    TSSCOD_0_0: "MED",
    targetpricestatus: 1,
    isnotationadministrative: 20,
    statut: 1,
    date: "2025-09-25",
    datecloture: "2026-10-05",
    etat_text: "En cours",
    etat_badge: "primary",
    reference: "AMI-2025-001",
    designation: "AMI - Partenariat construction hôpital régional",
    attachments: [
      { id: "34", designation: "Dossier AMI Construction", url: "/docs/ami-construction.pdf", documentspecification: { id: "34", designation: "AMI", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "35", designation: "Cahier des charges architectural", url: "/docs/cdc-architecture.pdf", documentspecification: { id: "35", designation: "CDC", nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "1",
    typemarche: { id: "1", designation: "Bâtiment et construction" },
    typeprocedure_id: "1",
    typeprocedure: { id: "1", designation: "AMI" },
    datepublication: "2025-09-10",
    aoarticles: [
      {
        id: "34",
        quantite: 1,
        targetprice: 50000000,
        coeff: 1.0,
        targetpricestatus: 0,
        article: {
          id: "34",
          code: "CONST001",
          designation: "Construction hôpital 200 lits"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "34",
        fournisseur: {
          id: "34",
          nom: "Construction Internationale SA",
          email: "ami@construction-int.com",
          score: 93,
          telephone: "+33 1 56 78 90 12",
          adresse: "Tour Manhattan, Paris La Défense",
          typefournisseur: { id: "7", designation: "Entreprise BTP" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      },
      {
        id: "35",
        fournisseur: {
          id: "35",
          nom: "Madagascar Construction Group",
          email: "direction@mcg.mg",
          score: 86,
          telephone: "+261 20 22 901 23",
          adresse: "Immeuble MCG, Antananarivo",
          typefournisseur: { id: "7", designation: "Entreprise BTP" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: []
  },
  {
    id: "17",
    isnotationfournisseur: 45,
    isnotationarticle: 35,
    TSSCOD_0_0: "MED",
    targetpricestatus: 0,
    isnotationadministrative: 20,
    statut: 2,
    date: "2025-09-28",
    datecloture: "2026-11-10",
    etat_text: "Manifestations reçues",
    etat_badge: "info",
    reference: "AMI-2025-002",
    designation: "AMI - Gestion des déchets médicaux",
    attachments: [
      { id: "36", designation: "Dossier AMI Déchets médicaux", url: "/docs/ami-dechets.pdf", documentspecification: { id: "36", designation: "AMI", nature:"", etatetexte: "Valide" }, isannexe: 0 },
      { id: "37", designation: "Règlementation environnementale", url: "/docs/reglement-environnement.pdf", documentspecification: { id: "37", designation: "Règlement",nature:"", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "12",
    typemarche: { id: "12", designation: "Services environnementaux" },
    typeprocedure_id: "1",
    typeprocedure: { id: "1", designation: "AMI" },
    datepublication: "2025-09-15",
    aoarticles: [
      {
        id: "35",
        quantite: 1,
        targetprice: 1200000,
        coeff: 1.0,
        targetpricestatus: 0,
        article: {
          id: "35",
          code: "ENV001",
          designation: "Service de traitement déchets médicaux"
        }
      }
    ],
    aofournisseurs: [
      {
        id: "36",
        fournisseur: {
          id: "36",
          nom: "EcoMed Waste Solutions",
          email: "proposals@ecomedwaste.com",
          score: 88,
          telephone: "+44 20 1234 5678",
          adresse: "Environmental Center, London",
          typefournisseur: { id: "8", designation: "Spécialiste environnement" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    soumissions: [
      {
        id: "36",
        statut: 2,
        date: "2025-09-26",
        score: 0,
        isbc: 0,
        iscontrat: 0,
        ao_id: "17",
        fournisseur_id: "36",
        fournisseur: {
          id: "36",
          nom: "EcoMed Waste Solutions",
          email: "proposals@ecomedwaste.com",
          score: 88,
          telephone: "+44 20 1234 5678",
          adresse: "Environmental Center, London",
          typefournisseur: { id: "8", designation: "Spécialiste environnement" },
          categoriefournisseur: { id: "1", designation: "A" }
        },
        soumissionarticles: [
          {
            id: "36",
            isselected: 0,
            resultatevaluation: "Manifestation d'intérêt reçue",
            prixunitairepropose: 1150000,
            presenceechantillon: 0,
            presencedossierstech: 1,
            pays_id: "GB",
            observationsaq: "Expérience internationale confirmée",
            prequalification: "En évaluation",
            statutamm: "N/A",
            fabricant_id: "36",
            fabricant: { id: "36", designation: "EcoMed Waste Solutions" },
            article_id: "35",
            article: {
              id: "35",
              designation: "Service de traitement déchets médicaux",
              code: "ENV001",
              prix: 1150000,
              quantite: 1
            },
            score: 0,
            typecondition_id: "3",
            typecondition: { id: "3", designation: "DDP" }
          }
        ]
      }
    ]
  },

  // 8. AO Transporteur (TRS)
  {
    id: "18",
    isnotationfournisseur: 40,
    isnotationarticle: 30,
    isnotationadministrative: 30,
    TSSCOD_0_0: "TRS",
    targetpricestatus: 0,
    statut: 1,
    date: "2025-09-30",
    datecloture: "2026-12-15",
    etat_text: "En cours",
    etat_badge: "primary",
    reference: "AO-TRS-2025-001",
    designation: "Transport de produits pharmaceutiques et équipements médicaux",
    attachments: [
      { id: "40", designation: "Cahier des charges transport", url: "/docs/cdc-transport.pdf", documentspecification: { id: "40", designation: "CDC", nature: "", etatetexte: "Valide" }, isannexe: 0 },
      { id: "41", designation: "Spécifications logistiques", url: "/docs/spec-logistique.pdf", documentspecification: { id: "41", designation: "Spec", nature: "", etatetexte: "Valide" }, isannexe: 1 }
    ],
    typemarche_id: "8",
    typemarche: { id: "8", designation: "Transport" },
    typeprocedure_id: "1",
    typeprocedure: { id: "1", designation: "Appel d'offres ouvert" },
    datepublication: "2025-09-15",
    aoarticles: [],
    aofournisseurs: [
      {
        id: "40",
        fournisseur: {
          id: "40",
          nom: "TransMadagascar Logistique",
          email: "contact@transmadagascar.mg",
          score: 88,
          telephone: "+261 20 22 456 78",
          adresse: "Zone Portuaire, Toamasina",
          typefournisseur: { id: "9", designation: "Transporteur" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      },
      {
        id: "41",
        fournisseur: {
          id: "41",
          nom: "Express Cargo Madagascar",
          email: "operations@expresscargo.mg",
          score: 85,
          telephone: "+261 20 22 567 89",
          adresse: "Aéroport Ivato, Antananarivo",
          typefournisseur: { id: "9", designation: "Transporteur" },
          categoriefournisseur: { id: "1", designation: "A" }
        }
      }
    ],
    offretransports: [
      {
        id: "3",
        detailoffretransports: [
          {
            id: "7",
            axe: {
              id: 19,
              designation: "HAUTE MATSIATRA",
              province: { id: 2 },
              axetonnages: [
                { id: "35", tonnage: { designation: "24.85", tonnage: 24.85 } },
                { id: "36", tonnage: { designation: "11.35", tonnage: 11.35 } },
                { id: "37", tonnage: { designation: "12.3", tonnage: 12.3 } },
                { id: "132", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 7 } },
                { id: "133", tonnage: { designation: "11.795", tonnage: 11.795 } },
                { id: "134", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 11 } },
                { id: "216", tonnage: { designation: "10.976", tonnage: 10.976 } },
                { id: "217", tonnage: { designation: "10.409", tonnage: 10.409 } }
              ]
            },
            offretransport_id: 3,
            unite: null,
            unite_id: null
          },
          {
            id: "8",
            axe: {
              id: 18,
              designation: "FITOVINANY",
              province: { id: 2 },
              axetonnages: [
                { id: "44", tonnage: { designation: "19", tonnage: 19 } },
                { id: "45", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 7 } },
                { id: "46", tonnage: { designation: "10", tonnage: 10 } },
                { id: "141", tonnage: { designation: "11.8", tonnage: 11.8 } },
                { id: "142", tonnage: { designation: "25.55", tonnage: 25.55 } },
                { id: "224", tonnage: { designation: "10.976", tonnage: 10.976 } },
                { id: "225", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 15 } },
                { id: "226", tonnage: { designation: "10.28", tonnage: 10.28 } }
              ]
            },
            offretransport_id: 3,
            unite: null,
            unite_id: null
          },
          {
            id: "9",
            axe: {
              id: 17,
              designation: "EST",
              province: { id: 5 },
              axetonnages: [
                { id: "26", tonnage: { designation: "10.409", tonnage: 10.409 } },
                { id: "27", tonnage: { designation: "12.2", tonnage: 12.2 } },
                { id: "28", tonnage: { designation: "25.1", tonnage: 25.1 } },
                { id: "123", tonnage: { designation: "10", tonnage: 10 } },
                { id: "124", tonnage: { designation: "4.15", tonnage: 4.15 } },
                { id: "125", tonnage: { designation: "3.22", tonnage: 3.22 } },
                { id: "210", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 6 } },
                { id: "211", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 9 } }
              ]
            },
            offretransport_id: 3,
            unite: null,
            unite_id: null
          },
          {
            id: "10",
            axe: {
              id: 16,
              designation: "DIANA",
              province: { id: 1 },
              axetonnages: [
                { id: "74", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 5 } },
                { id: "75", tonnage: { designation: "70", tonnage: 70 } },
                { id: "76", tonnage: { designation: "24.3", tonnage: 24.3 } },
                { id: "165", tonnage: { designation: "10", tonnage: 10 } },
                { id: "166", tonnage: { designation: "25.1", tonnage: 25.1 } },
                { id: "167", tonnage: { designation: "7.51", tonnage: 7.51 } },
                { id: "253", tonnage: { designation: "Tonnage généré automatiquement", tonnage: 15 } }
              ]
            },
            offretransport_id: 3,
            unite: null,
            unite_id: null
          }
        ]
      }
    ],
    soumissions: []
  }
];