import React, { useState } from "react";
import { 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiMail, 
  FiCalendar, 
  FiCreditCard, 
  FiCheck, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiInfo
} from "react-icons/fi";
import DocumentsSpecifier from "../UploadDocument";

// Props interface
interface AMMPrequalificationProps {
  Data: any;
}

// Types pour les statuts
type StatutType = "Valide" | "En cours" | "Non valide";

// Interface pour un article avec statuts AMM/Préqualification
interface ArticleAMM {
  id: string;
  nom: string;
  fabricant: string;
  statutAMM: StatutType;
  statutPrequalification: StatutType;
  demandeClient?: {
    type: string;
    dateEnvoi: string;
    montantFrais: string;
    description: string;
    documentsRequis: string[];
  };
}

// Interface pour les documents uploadés
interface UploadedDocument {
  id: string;
  name: string;
  uploaded: boolean;
  uploadedFiles?: File[];
}

const AMMPrequalification: React.FC<AMMPrequalificationProps> = ({ Data }) => {
  // 🔧 VARIABLE DE TEST - Mettre à false pour utiliser les données réelles
  const USE_MOCK_DATA = true;

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  
  // State pour gérer les documents uploadés par article
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedDocument[]>>({});

  // MOCK DATA - À remplacer par les données réelles plus tard
  const generateMockArticles = (): ArticleAMM[] => {
    if (USE_MOCK_DATA) {
      return [
        // Cas 1: V/V - AMM Valide + Préqualification Valide (Tout est OK)
        {
          id: "1",
          nom: "Paracétamol 500mg - Boîte de 20 comprimés",
          fabricant: "Laboratoires Pharma Plus",
          statutAMM: "Valide",
          statutPrequalification: "Valide",
          // Pas de demande client car tout est valide
        },
        
        // Cas 2: V/X - AMM Valide + Préqualification Non valide
        {
          id: "2",
          nom: "Amoxicilline 1g - Boîte de 12 gélules",
          fabricant: "Pharma Solutions SA",
          statutAMM: "Valide",
          statutPrequalification: "Non valide",
          demandeClient: {
            type: "Demande de préqualification OMS",
            dateEnvoi: "20 janvier 2025",
            montantFrais: "1 800 000 MGA",
            description: "La préqualification OMS de ce produit a expiré ou a été refusée. La SALAMA vous invite à soumettre une nouvelle demande de préqualification.",
            documentsRequis: [
              "Dossier maître du site (SMF)",
              "Études de bioéquivalence",
              "Certificat d'analyse des lots de validation",
            ],
          },
        },
        
        // Cas 3: X/V - AMM Non valide + Préqualification Valide
        {
          id: "3",
          nom: "Ibuprofène 400mg - Boîte de 30 comprimés",
          fabricant: "MediCare Industries",
          statutAMM: "Non valide",
          statutPrequalification: "Valide",
          demandeClient: {
            type: "Demande d'enregistrement AMM",
            dateEnvoi: "18 janvier 2025",
            montantFrais: "2 200 000 MGA",
            description: "L'AMM de ce produit n'est pas valide à Madagascar. Veuillez procéder à l'enregistrement auprès de l'AGMED.",
            documentsRequis: [
              "Certificat de conformité aux normes GMP",
              "Résumé des caractéristiques du produit (RCP)",
              "Dossier CTD complet",
            ],
          },
        },
        
        // Cas 4: X/X - AMM Non valide + Préqualification Non valide
        {
          id: "4",
          nom: "Métronidazole 250mg - Boîte de 20 comprimés",
          fabricant: "GeneriPharma Ltd",
          statutAMM: "Non valide",
          statutPrequalification: "Non valide",
          demandeClient: {
            type: "Demande d'enregistrement AMM et Préqualification",
            dateEnvoi: "22 janvier 2025",
            montantFrais: "4 000 000 MGA",
            description: "Ce produit nécessite à la fois l'enregistrement AMM et la préqualification OMS. Veuillez soumettre les documents pour les deux procédures.",
            documentsRequis: [
              "Certificat de conformité aux normes GMP",
              "Dossier CTD complet",
              "Études de bioéquivalence",
              "Dossier maître du site (SMF)",
              "Études de stabilité",
            ],
          },
        },
        
        // Cas 5: En cours / En cours - Les deux en attente
        {
          id: "5",
          nom: "Ciprofloxacine 500mg - Boîte de 10 comprimés",
          fabricant: "BioMed France",
          statutAMM: "En cours",
          statutPrequalification: "En cours",
          demandeClient: {
            type: "Suivi des demandes en cours",
            dateEnvoi: "10 janvier 2025",
            montantFrais: "3 500 000 MGA",
            description: "Les demandes d'AMM et de préqualification sont en cours de traitement. Veuillez fournir les documents complémentaires demandés.",
            documentsRequis: [
              "Certificat de conformité aux normes GMP",
              "Résumé des caractéristiques du produit (RCP)",
            ],
          },
        },
        
        // Cas 6: V / En cours - AMM Valide, Préqualification en cours
        {
          id: "6",
          nom: "Oméprazole 20mg - Boîte de 28 gélules",
          fabricant: "PharmaEurope GmbH",
          statutAMM: "Valide",
          statutPrequalification: "En cours",
          demandeClient: {
            type: "Demande de préqualification OMS",
            dateEnvoi: "12 janvier 2025",
            montantFrais: "1 500 000 MGA",
            description: "La demande de préqualification OMS est en cours. Documents complémentaires requis pour finaliser le dossier.",
            documentsRequis: [
              "Études de bioéquivalence mises à jour",
              "Rapport de validation des procédés",
            ],
          },
        },
        
        // Cas 7: En cours / V - AMM en cours, Préqualification Valide
        {
          id: "7",
          nom: "Artéméther-Luméfantrine 20/120mg - Boîte de 24 comprimés",
          fabricant: "MalariaFree Pharma",
          statutAMM: "En cours",
          statutPrequalification: "Valide",
          demandeClient: {
            type: "Demande d'enregistrement AMM",
            dateEnvoi: "08 janvier 2025",
            montantFrais: "2 800 000 MGA",
            description: "Ce produit est préqualifié par l'OMS. L'enregistrement AMM à Madagascar est en cours de traitement.",
            documentsRequis: [
              "Certificat de préqualification OMS",
              "Adaptations pour le marché local",
            ],
          },
        },
        
        // Cas 8: V/V - Autre article tout valide
        {
          id: "8",
          nom: "Sérum physiologique 10ml - Lot de 20 unidoses",
          fabricant: "SterilMed International",
          statutAMM: "Valide",
          statutPrequalification: "Valide",
          // Pas de demande client car tout est valide
        },
      ];
    }

    const statuts: StatutType[] = ["Valide", "En cours", "Non valide"];
    return Data.articles.map((article: any, index: number) => ({
      id: article.id || String(index),
      nom: article.nom || `Article ${index + 1}`,
      fabricant: article.fabricant?.designation || "Fabricant non spécifié",
      statutAMM: statuts[index % 3] as StatutType,
      statutPrequalification: statuts[(index + 1) % 3] as StatutType,
      demandeClient: index % 2 === 0 ? {
        type: "Demande d'enregistrement AMM",
        dateEnvoi: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        montantFrais: `${(1500000 + index * 500000).toLocaleString('fr-FR')} MGA`,
        description: "La SALAMA vous demande de procéder à l'enregistrement de ce produit auprès de l'Agence du Médicament de Madagascar (AGMED).",
        documentsRequis: [
          "Certificat de conformité aux normes GMP",
          "Résumé des caractéristiques du produit (RCP)",
        ],
      } : undefined,
    }));
  };

  const articles = generateMockArticles();

  // Fonction pour obtenir le style du badge selon le statut
  const getBadgeStyle = (statut: StatutType): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: 500,
    };

    switch (statut) {
      case "Valide":
        return { ...base, backgroundColor: "#DCFCE7", color: "#166534" };
      case "En cours":
        return { ...base, backgroundColor: "#FEF3C7", color: "#92400E" };
      case "Non valide":
        return { ...base, backgroundColor: "#FEE2E2", color: "#991B1B" };
      default:
        return base;
    }
  };

  // Fonction pour obtenir l'icône du badge
  const getBadgeIcon = (statut: StatutType) => {
    switch (statut) {
      case "Valide":
        return <FiCheckCircle size={14} />;
      case "En cours":
        return <FiClock size={14} />;
      case "Non valide":
        return <FiAlertCircle size={14} />;
      default:
        return null;
    }
  };

  const handleVoirSuivi = (articleId: string) => {
    setExpandedRowId(expandedRowId === articleId ? null : articleId);
  };

  const handleConfirmerDemande = (articleId: string) => {
    alert(`Demande confirmée pour l'article ${articleId}`);
    setExpandedRowId(null);
  };

  const handleRefuserDemande = (articleId: string) => {
    alert(`Demande refusée pour l'article ${articleId}`);
    setExpandedRowId(null);
  };

  // Générer les documents pour un article donné
  const getDocumentsForArticle = (articleId: string, documentsRequis: string[]): UploadedDocument[] => {
    const existingDocs = uploadedDocuments[articleId] || [];
    return documentsRequis.map((docName, idx) => {
      const docId = `${articleId}-doc-${idx}`;
      const existing = existingDocs.find(d => d.id === docId);
      return existing || {
        id: docId,
        name: docName,
        uploaded: false,
        uploadedFiles: [],
      };
    });
  };

  // Handler pour l'upload de fichiers
  const handleFileUpload = (articleId: string) => (documentId: string, files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    setUploadedDocuments(prev => {
      const articleDocs = prev[articleId] || [];
      const docIndex = articleDocs.findIndex(d => d.id === documentId);
      
      if (docIndex >= 0) {
        const updatedDocs = [...articleDocs];
        updatedDocs[docIndex] = {
          ...updatedDocs[docIndex],
          uploaded: true,
          uploadedFiles: [...(updatedDocs[docIndex].uploadedFiles || []), ...fileArray],
        };
        return { ...prev, [articleId]: updatedDocs };
      } else {
        return {
          ...prev,
          [articleId]: [
            ...articleDocs,
            { id: documentId, name: '', uploaded: true, uploadedFiles: fileArray }
          ]
        };
      }
    });
  };

  // Handler pour reset un fichier
  const handleFileReset = (articleId: string) => (documentId: string) => {
    setUploadedDocuments(prev => {
      const articleDocs = prev[articleId] || [];
      const updatedDocs = articleDocs.map(d => 
        d.id === documentId 
          ? { ...d, uploaded: false, uploadedFiles: [] }
          : d
      );
      return { ...prev, [articleId]: updatedDocs };
    });
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100%", padding: "20px" }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        padding: "24px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1E293B", margin: 0 }}>
            Suivi AMM / Préqualification
          </h2>
        </div>

        {/* Bannière d'information */}
        <div style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #DBEAFE",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <div style={{
            width: "18px",
            height: "18px",
            backgroundColor: "#3B82F6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
          }}>
            <FiInfo size={10} />
          </div>
          <p style={{ fontSize: "0.813rem", color: "#1E40AF", margin: 0 }}>
            Consultez le statut réglementaire de vos articles et répondez aux demandes d'enregistrement.
          </p>
        </div>

        {/* Tableau des articles */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Article / Fabricant
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Statut AMM
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Statut Préqualification
              </th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <React.Fragment key={article.id}>
                {/* Ligne principale */}
                <tr
                  style={{
                    borderBottom: expandedRowId === article.id ? "none" : "1px solid #E2E8F0",
                    backgroundColor: expandedRowId === article.id ? "#F8FAFC" : "transparent",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (expandedRowId !== article.id) {
                      e.currentTarget.style.backgroundColor = "#FAFAFA";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (expandedRowId !== article.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <td style={{ padding: "16px", fontSize: "0.875rem", color: "#1E293B", verticalAlign: "middle" }}>
                    <div style={{ fontWeight: 500, color: "#1E293B", marginBottom: "4px" }}>{article.nom}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{article.fabricant}</div>
                  </td>
                  <td style={{ padding: "16px", verticalAlign: "middle" }}>
                    <span style={getBadgeStyle(article.statutAMM)}>
                      {getBadgeIcon(article.statutAMM)} {article.statutAMM}
                    </span>
                  </td>
                  <td style={{ padding: "16px", verticalAlign: "middle" }}>
                    <span style={getBadgeStyle(article.statutPrequalification)}>
                      {getBadgeIcon(article.statutPrequalification)} {article.statutPrequalification}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", verticalAlign: "middle" }}>
                    <button
                      onClick={() => handleVoirSuivi(article.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        backgroundColor: "transparent",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        color: "#374151",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#F3F4F6";
                        e.currentTarget.style.borderColor = "#9CA3AF";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "#D1D5DB";
                      }}
                    >
                      {expandedRowId === article.id ? "Masquer le détail" : "Voir le suivi"}
                      {expandedRowId === article.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                  </td>
                </tr>

                {/* Section détaillée expansible */}
                {expandedRowId === article.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: "0", borderBottom: "1px solid #E2E8F0" }}>
                      <div style={{ backgroundColor: "#F8FAFC", padding: "20px" }}>
                        
                        {/* Section: Statuts réglementaires */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ fontSize: "0.813rem", fontWeight: 600, color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                            Statuts réglementaires
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                            {/* Carte AMM */}
                            <div style={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "12px",
                              padding: "16px",
                              border: "1px solid #E5E7EB",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontWeight: 600, color: "#1F2937" }}>AMM</span>
                                <span style={getBadgeStyle(article.statutAMM)}>
                                  {getBadgeIcon(article.statutAMM)} {article.statutAMM}
                                </span>
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: 0 }}>
                                Autorisation de Mise sur le Marché
                              </p>
                            </div>
                            {/* Carte Préqualification */}
                            <div style={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "12px",
                              padding: "16px",
                              border: "1px solid #E5E7EB",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontWeight: 600, color: "#1F2937" }}>Préqualification</span>
                                <span style={getBadgeStyle(article.statutPrequalification)}>
                                  {getBadgeIcon(article.statutPrequalification)} {article.statutPrequalification}
                                </span>
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: 0 }}>
                                Préqualification OMS
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Section: Demandes reçues du client */}
                        {article.demandeClient && (
                          <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ fontSize: "0.813rem", fontWeight: 600, color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                              Demandes reçues du client
                            </h4>
                            <div style={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "10px",
                              padding: "16px",
                              border: "1px solid #E5E7EB",
                              borderLeft: "4px solid #2563EB",
                            }}>
                              {/* Titre de la demande */}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <FiMail size={18} style={{ color: "#2563EB" }} />
                                <h5 style={{ fontWeight: 600, color: "#1F2937", margin: 0, fontSize: "0.938rem" }}>
                                  {article.demandeClient.type}
                                </h5>
                              </div>
                              
                              {/* Infos clés */}
                              <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.813rem", color: "#4B5563" }}>
                                  <FiCalendar size={14} style={{ color: "#6B7280" }} />
                                  <span>Date d'envoi : <strong>{article.demandeClient.dateEnvoi}</strong></span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.813rem", color: "#4B5563" }}>
                                  <FiCreditCard size={14} style={{ color: "#6B7280" }} />
                                  <span>Montant des frais : <strong>{article.demandeClient.montantFrais}</strong></span>
                                </div>
                              </div>
                              
                              {/* Description */}
                              <div style={{
                                backgroundColor: "#F9FAFB",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                marginBottom: "12px",
                              }}>
                                <p style={{ fontSize: "0.813rem", color: "#4B5563", margin: 0, lineHeight: 1.5 }}>
                                  {article.demandeClient.description}
                                </p>
                              </div>
                              
                              {/* Documents requis - avec upload */}
                              <div style={{ marginTop: "16px" }}>
                                <h6 style={{ fontWeight: 500, fontSize: "0.813rem", color: "#374151", marginBottom: "12px" }}>
                                  Documents à fournir :
                                </h6>
                                <DocumentsSpecifier
                                  documents={getDocumentsForArticle(article.id, article.demandeClient.documentsRequis)}
                                  onFileUpload={handleFileUpload(article.id)}
                                  onFileReset={handleFileReset(article.id)}
                                  acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section: Action fournisseur */}
                        {article.demandeClient && (
                          <div>
                            <div style={{
                              backgroundColor: "#FFFBEB",
                              border: "1px solid #FCD34D",
                              borderRadius: "10px",
                              padding: "16px",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                <span style={{
                                  backgroundColor: "#F59E0B",
                                  color: "white",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.688rem",
                                  fontWeight: 600,
                                }}>Action requise</span>
                              </div>
                              <p style={{ fontSize: "0.875rem", color: "#92400E", marginBottom: "12px" }}>
                                Confirmez-vous la prise en charge de cette demande d'enregistrement ?
                              </p>
                              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => handleConfirmerDemande(article.id)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    backgroundColor: "#16A34A",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    fontSize: "0.813rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#15803D"}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#16A34A"}
                                >
                                  <FiCheck size={14} /> Confirmer la demande
                                </button>
                                <button
                                  onClick={() => handleRefuserDemande(article.id)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    backgroundColor: "white",
                                    color: "#DC2626",
                                    border: "1px solid #DC2626",
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    fontSize: "0.813rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#FEF2F2";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "white";
                                  }}
                                >
                                  <FiX size={14} /> Refuser la demande
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message si pas de demande client */}
                        {!article.demandeClient && (
                          <div style={{
                            backgroundColor: "#F0FDF4",
                            border: "1px solid #BBF7D0",
                            borderRadius: "10px",
                            padding: "16px",
                            textAlign: "center",
                          }}>
                            <div style={{ marginBottom: "6px", color: "#16A34A" }}>
                              <FiCheckCircle size={28} />
                            </div>
                            <p style={{ color: "#166534", fontWeight: 500, margin: 0, fontSize: "0.875rem" }}>
                              Aucune action requise pour cet article. Tous les statuts sont valides.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Légende des statuts */}
        <div style={{
          marginTop: "20px",
          padding: "12px 16px",
          backgroundColor: "#F8FAFC",
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Légende des statuts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#4B5563" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A34A" }}></div>
              <span><strong>Valide :</strong> Document validé et actif</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#4B5563" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }}></div>
              <span><strong>En cours :</strong> Traitement en cours</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#4B5563" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#DC2626" }}></div>
              <span><strong>Non valide :</strong> Action requise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMMPrequalification;
