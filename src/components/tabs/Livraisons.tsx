import React, { useState, useEffect } from "react";
import { FaClipboardCheck, FaBarcode, FaMapMarkerAlt, FaTruck, FaCircle, FaCheck, FaCalendarAlt } from "react-icons/fa";
import folder_icon from "../../assets/images/folder_img.png";
import doc_icon from "../../assets/images/doc_icon.png";
import ConfirmationPopup from "../ui/ConfirmationPopup";
import { Badge, Button, Modal, Table, Form } from "react-bootstrap";
import { createItem } from "../../api/crudService";
import { useNotification } from "../../hooks/useNotification";
import NotificationPopup from "../ui/NotificationPopup";
import { fetchGraphQL } from "../../api/graphql/graphqlService";
import { getExpeditionsQuery } from "../../api/graphql/queries";
import { User } from "../../types/user.types";


interface Document {
  id: string | number;
  label: string;
  pdfUrl: string;
  date: string;
  status?: string;
  numeroCommande?: string;
  destination?: string;
  transporteur?: string;
}

interface Expedition {
  id: number;
  statut: string;
  bailleur_id: number;
  date_expedition: string;
  observation: string;
  expeditionaxes?: Array<{
    axe: {
      designation: string;
    };
    expeditionclients?: Array<{
      client: {
        designation: string;
      };
    }>;
  }>;
}

interface ExpeditionsResponse {
  data: {
    expeditions: Expedition[];
  };
}

interface LivraisonsProps {
  data?: any;
  orderType?:  'programme' | 'rc_public' | 'rc_prive' | 'tef' | 'be' | 'ferme' | 'urgence' | 'enlevement' | null;
  Data?: any; // Données de la commande complète
  setData?: React.Dispatch<React.SetStateAction<any>>;
  user?:  User;
}

const Livraisons: React.FC<LivraisonsProps> = ({ 
  data, 
  orderType, 
  Data, 
  setData, 
  user 
}) => {
  // États
  const [confirmation, setConfirmation] = useState({
    isVisible: false,
    action: () => {},
    title: "",
    message: "",
  });

  // États pour la validation d'état
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationConfirmation, setShowValidationConfirmation] = useState(false);
  
  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // États pour les expéditions
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loadingExpeditions, setLoadingExpeditions] = useState(false);
  const [errorExpeditions, setErrorExpeditions] = useState<string | null>(null);

  // Récupérer les expéditions depuis l'API
  useEffect(() => {
    const fetchExpeditions = async () => {
      if (!user?.client_id) return;

      setLoadingExpeditions(true);
      setErrorExpeditions(null);

      try {
        console.log("🔄 Récupération des expéditions pour client_id:", user?.client_id);
        
        const query = getExpeditionsQuery( user?.client_id);
        const response = await fetchGraphQL<ExpeditionsResponse>(query);

        console.log("✅ Réponse API expéditions:", response.data);

        if (response.data?.data?.expeditions) {
          setExpeditions(response.data.data.expeditions);
        } else {
          setExpeditions([]);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des expéditions:", error);
        setErrorExpeditions("Erreur lors du chargement des expéditions");
      } finally {
        setLoadingExpeditions(false);
      }
    };

    fetchExpeditions();
  }, [Data?.client_id]);

  // Transformer les expéditions en format compatible avec l'affichage
  const livraisonsByDate: Array<[string, Array<Document>]> = React.useMemo(() => {
    // Si des données sont passées en props, les utiliser
    if (data?.livraisons) {
      return data.livraisons;
    }

    // Sinon, utiliser les expéditions de l'API
    if (expeditions.length > 0) {
      const groupedByDate: { [key: string]: Document[] } = {};

      expeditions.forEach((expedition) => {
        const dateKey = new Date(expedition.date_expedition).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }

        // Récupérer la destination depuis le premier client de l'expédition
        const destination = expedition.expeditionaxes?.[0]?.expeditionclients?.[0]?.client?.designation || "Non définie";
        
        groupedByDate[dateKey].push({
          id: expedition.id,
          date: new Date(expedition.date_expedition).toLocaleDateString('fr-FR'),
          label: "Bon de commande",
          pdfUrl: `/docs/expedition-${expedition.id}.pdf`, // À adapter selon votre API
          numeroCommande: Data?.numero || String(expedition.id),
          destination: destination,
          transporteur: "SALAMA" // Peut être adapté selon vos données
        });
      });

      return Object.entries(groupedByDate);
    }

    // Sinon utiliser les mocks par défaut
    return [
      [
        "15 Novembre 2025",
        [
          { 
            id: "l001", 
            date: "30 Novembre 2025", 
            label: "Bon de commande ", 
            pdfUrl: "/docs/bordereau-001.pdf",
            numeroCommande: "1",
            destination: "Antananarivo",
            transporteur: "SOTRAMAD"
          },
        ],
      ],
    ];
  }, [data?.livraisons, expeditions, Data?.numero]);
  
    // Déterminer le statut de la commande et sa couleur
    const getStatusBadge = (status: string, badgeClass?: string) => {
      // Si une classe de badge spécifique est fournie (pour les commandes programme)
      if (badgeClass) {
        return <Badge className={badgeClass}>{status || "Non défini"}</Badge>;
      }
      
      // Logique par défaut basée sur le texte du statut
      let bgColor = "secondary";
      switch(status?.toLowerCase()) {
        case "validée":
        case "validee":
        case "valide":
          bgColor = "success";
          break;
        case "en attente":
        case "attente":
        case "en attente de validation":
        case "en attente salama":
          bgColor = "warning";
          break;
        case "refusée":
        case "refusee":
        case "refus":
          bgColor = "danger";
          break;
        case "en cours":
          bgColor = "info";
          break;
        default:
          bgColor = "secondary";
      }
      
      return <Badge bg={bgColor}>{status || "Non défini"}</Badge>;
    };

  // Fonction pour demander confirmation de validation d'état
  const handleRequestStateValidation = () => {
    setShowValidationConfirmation(true);
  };

  // Fonction pour annuler la validation d'état
  const handleCancelStateValidation = () => {
    setShowValidationConfirmation(false);
  };

  // Fonction pour valider l'état après confirmation (finalisation de la commande)
  const handleConfirmStateValidation = async () => {
    setShowValidationConfirmation(false);
    setIsValidating(true);

    try {
      console.log("🔄 Début de la finalisation de la commande...");
      console.log("📋 ID Commande:", Data?.id);
      console.log("👤 ID Utilisateur:", user?.id);

      // Préparer le payload pour finaliser la commande (état final)
      const stateValidationPayload = {
        id: Data?.numero,
        user_id: user?.id,
        validationclient: 1
      };

      console.log("📤 Payload de finalisation:", stateValidationPayload);

      const response = await createItem("api/commande/statut", stateValidationPayload);

      console.log("✅ Réponse de l'API de finalisation:", response);

      // Vérifier si la réponse contient une erreur (success: null ou succes: null)
      const responseData = response?.data as { succes?: null | boolean; success?: null | boolean; message?: string };
      if (responseData?.succes === null || responseData?.success === null) {
        const errorMessage = responseData?.message || "Erreur lors de la finalisation";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de finalisation", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error("❌ Erreur HTTP lors de la finalisation:", response.status, response.statusText);
        const errorMessage = responseData?.message || response.statusText;
        showError("Erreur de finalisation", `La finalisation a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors de la finalisation : ${errorMessage}`);
      }

      console.log("✅ Commande finalisée avec succès!");
      
      // Mettre à jour les données locales pour refléter le changement d'état
      if (Data && setData) {
        const updatedData = { ...Data, etat: 5 };
        setData(updatedData);
      }
      
      showSuccess("Commande finalisée", "La commande a été finalisée avec succès !");
      
          // Recharger la page après un court délai pour permettre à la notification d'être visible
    setTimeout(() => {
      window.location.reload();
    }, 3000); // Délai de 3 secondes

    
    } catch (error) {
      console.error("❌ Erreur lors de la finalisation:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError("Erreur de finalisation", `Impossible de finaliser la commande : ${errorMessage}`);
    } finally {
      setIsValidating(false);
    }
  };

  console.log(
    "donne passe en parametre ",data
  ) 
    
    return (
    <>
      {/* Styles CSS pour les améliorations */}
      <style>{`
        .document-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(31, 176, 91, 0.2) !important;
        }
        
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 176, 91, 0.2) !important;
        }
        
        .document-item {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Smooth transitions for all interactive elements */
        .btn, .card, .badge {
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div
        className="bg-white p-4 rounded-3 shadow-sm"
        style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}
      >
        {/* En-tête avec design amélioré */}
        <div 
          className="mb-4 p-3 rounded-3 d-flex align-items-center justify-content-between"
          style={{ 
            background: "linear-gradient(135deg, #1FB05B 0%, #17924a 100%)",
            boxShadow: "0 4px 12px rgba(31, 176, 91, 0.2)"
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)"
              }}
            >
              <img src={folder_icon} alt="Livraisons" style={{ width: 28, filter: "brightness(0) invert(1)" }} />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.25rem" }}>
                Livraisons
              </h5>
              <small className="text-white-50">Gestion des bons de commande et livraisons</small>
            </div>
          </div>
          <div className="badge bg-white text-success fw-semibold px-3 py-2" style={{ fontSize: "0.9rem" }}>
            <i className="fas fa-box me-2"></i>
            {livraisonsByDate.reduce((acc, [, docs]) => acc + docs.length, 0)} {livraisonsByDate.reduce((acc, [, docs]) => acc + docs.length, 0) > 1 ? 'documents' : 'document'}
          </div>
        </div>

      {/* Informations de la commande avec design card moderne */}
      <div 
        className="mb-4 p-4 rounded-3 position-relative overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, #f8fff8 0%, #e8f5e9 100%)",
          border: "2px solid #e0f2e0",
          boxShadow: "0 2px 8px rgba(31, 176, 91, 0.08)"
        }}
      >
        {/* Decoration background pattern */}
        <div 
          className="position-absolute" 
          style={{ 
            top: 0, 
            right: 0, 
            width: "200px", 
            height: "200px",
            opacity: 0.05,
            background: "radial-gradient(circle, #1FB05B 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none"
          }}
        ></div>

        <div className="row g-4 position-relative">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "45px",
                  height: "45px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(31, 176, 91, 0.15)"
                }}
              >
                <FaBarcode className="text-success" style={{ fontSize: "1.2rem" }} />
              </div>
              <div>
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>N° COMMANDE</small>
                <strong className="text-dark" style={{ fontSize: "1.1rem" }}>
                  {Data?.numero || Data?.id || "Non défini"}
                </strong>
              </div>
            </div>
          </div>

          {orderType !== 'programme' && (
            <>
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(31, 176, 91, 0.15)"
                    }}
                  >
                    <FaCalendarAlt className="text-success" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>DATE</small>
                    <strong className="text-dark" style={{ fontSize: "1.1rem" }}>
                      {Data?.created_at ? new Date(Data.created_at).toLocaleDateString('fr-FR') : "Non définie"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(31, 176, 91, 0.15)"
                    }}
                  >
                    <FaCircle className="text-success" style={{ fontSize: "0.8rem" }} />
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>STATUT</small>
                    <div className="mt-1">
                      {getStatusBadge(
                        Data?.etat <= 4 
                          ? (Data?.validationclient === null 
                              ? "En attente de validation" 
                              : Data?.validationsalama === null 
                                ? "En attente SALAMA" 
                                : "Validée")
                          : "Validée"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tableau des articles de la commande */}
      {(() => {
        // Filtrer pour n'afficher que les articles avec un sourceLot valide
        const filteredDetails = data?.detailcommandes?.filter((detail: any) => 
          detail.lot && detail.lot.trim() !== ''
        ) || [];
        
        return filteredDetails.length >= 0 && (
        <div 
          className="mb-4 p-4 rounded-3 position-relative overflow-hidden"
          style={{ 
            background: "linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)",
            border: "2px solid #e0f2e0",
            boxShadow: "0 2px 8px rgba(31, 176, 91, 0.08)"
          }}
        >
          {/* En-tête du tableau */}
          <div 
            className="mb-3 p-3 rounded-3 d-flex align-items-center gap-3"
            style={{ 
              background: "linear-gradient(135deg, #1FB05B 0%, #17924a 100%)",
              boxShadow: "0 4px 12px rgba(31, 176, 91, 0.2)"
            }}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)"
              }}
            >
              <i className="fas fa-pills text-white" style={{ fontSize: "1.5rem" }}></i>
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.25rem" }}>
                Articles de la commande
              </h5>
              <small className="text-white-50">Liste des produits commandés</small>
            </div>
            <div className="ms-auto badge bg-white text-success fw-semibold px-3 py-2" style={{ fontSize: "0.9rem" }}>
              <i className="fas fa-box me-2"></i>
              {filteredDetails.length} article{filteredDetails.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Boutons EXPORT et IMPORT RBC */}
          <div className="mb-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-success d-flex align-items-center gap-2"
              onClick={() => {
                // Fonctionnalité à implémenter ultérieurement
                console.log("Export RBC");
              }}
              style={{ 
                borderRadius: "10px", 
                fontWeight: "600",
                padding: "10px 20px",
                borderWidth: "2px"
              }}
            >
              <i className="fas fa-file-export"></i>
              EXPORT RBC
            </button>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={() => {
                // Fonctionnalité à implémenter ultérieurement
                console.log("Import RBC");
              }}
              style={{ 
                borderRadius: "10px", 
                fontWeight: "600",
                padding: "10px 20px",
                boxShadow: "0 4px 12px rgba(31, 176, 91, 0.3)",
                border: "none",
                background: "linear-gradient(135deg, #1FB05B 0%, #17924a 100%)"
              }}
            >
              <i className="fas fa-file-import"></i>
              IMPORT RBC
            </button>
          </div>

          {/* Tableau des articles */}
            <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-dark">
              <tr>
                <th className="border-0">Produit</th>
                <th className="border-0">Code</th>
                {orderType === 'programme' ? (
                <>
                  <th className="border-0 text-center">Unité</th>
                  <th className="border-0 text-center">Qté Début</th>
                  <th className="border-0 text-center">Qté Reçue</th>
                  <th className="border-0 text-center">Qté Distribuée</th>
                  <th className="border-0 text-center">Qté Fin</th>
                  <th className="border-0 text-center">CMM</th>
                  <th className="border-0 text-center">Qté Commandée</th>
                  <th className="border-0 text-center">Prix Unitaire</th>
                  <th className="border-0 text-center">Montant</th>
                  
                  {/* LIVRAISON PLANIFIER */}
                  <th className="border-0 text-center">Qté à Recevoir</th>
                  <th className="border-0 text-center">Date Prévue</th>
                  {/* LIVRAISON PLANIFIER */}
                  
                  {/* RECEPTION */}
                  <th className="border-0 text-center">Qté Utilisable</th>
                  {/* RECEPTION */}

                  {/* EXPEDITION */}
                  <th className="border-0 text-center">Qté Expédiée</th>
                  <th className="border-0 text-center">Date Expédition</th>
                  <th className="border-0 text-center">Chauffeur</th>
                  <th className="border-0 text-center">Véhicule</th>
                  <th className="border-0 text-center">Convoyeur</th>
                  {/* EXPEDITION */}
                  
                  {/* RECEPTION */}
                  <th className="border-0 text-center">Date Réception</th>
                  <th className="border-0 text-center">Observation</th>
                  {/* RECEPTION */}
                </>
                ) : (
                <>
                  <th className="border-0">Type</th>
                  <th className="border-0">Famille</th>
                  <th className="border-0 text-center">Quantité</th>
                  <th className="border-0 text-center">Conso Moyenne</th>
                  <th className="border-0 text-center">Prix Unitaire</th>
                  <th className="border-0 text-center">Montant</th>
                </>
                )}
              </tr>
              </thead>
              <tbody>
              {filteredDetails.map((detail: any, index: number) => (
                <tr key={detail.id || index}>
                <td>
                  <span className="text-wrap" style={{ minWidth: '150px', display: 'block' }}>
                  {detail.produit || detail.designation || "Non défini"}
                  </span>
                </td>
                <td>
                  <span style={{ minWidth: '80px', display: 'block' }}>
                  {detail.code || "N/A"}
                  </span>
                </td>
                
                {orderType === 'programme' ? (
                  <>
                  <td className="text-center">{detail.unite || 'N/A'}</td>
                  <td className="text-center">{detail.qte_debut || 0}</td>
                  <td className="text-center">{detail.qte_recue || 0}</td>
                  <td className="text-center">{detail.qte_distribuee || 0}</td>
                  <td className="text-center">{detail.qte_fin || 0}</td>
                  <td className="text-center">{detail.cmm?.toFixed(2) || 0}</td>
                  <td className="text-center">{detail.qte_commandee || 0}</td>
                  <td className="text-center">{(detail.prix || 0).toLocaleString('fr-FR')} AR</td>
                  <td className="text-center">
                    {((detail.qte_commandee || 0) * (detail.prix || 0)).toLocaleString('fr-FR')} AR
                  </td>
                  <td className="text-center">0</td>
                  <td className="text-center">Non définie</td>
                  <td className="text-center">
                    <Form.Control type="number" size="sm" value="" style={{ minWidth: '80px' }} />
                  </td>
                  <td className="text-center">0</td>
                  <td className="text-center">Non définie</td>
                  <td className="text-center">Non défini</td>
                  <td className="text-center">Non défini</td>
                  <td className="text-center">Non défini</td>
                  <td className="text-center">Non définie</td>
                  <td className="text-center">Aucune</td>
                  </>
                ) : (
                  <>
                  <td>
                    <Badge bg={detail.catalogue === 1 ? 'primary' : 'secondary'}>
                    {detail.catalogue === 1 ? "Catalogue" : "Hors Catalogue"}
                    </Badge>
                  </td>
                  <td>{detail.famille?.designation || "N/A"}</td>
                  <td className="text-center">{detail.quantite || 0}</td>
                  <td className="text-center">{detail.cmm || 0}</td>
                  <td className="text-center">{(detail.prix || detail.prix_unitaire || 0).toLocaleString('fr-FR')} AR</td>
                  <td className="text-center">
                    {((detail.quantite || 0) * (detail.prix || detail.prix_unitaire || 0)).toLocaleString('fr-FR')} AR
                  </td>
                  </>
                )}
                </tr>
              ))}
              </tbody>
              <tfoot>
              <tr className="table-success fw-bold">
                <td colSpan={orderType === 'programme' ? 10 : 5} className="text-end">
                <strong>Total :</strong>
                </td>
                <td className="text-center">
                <strong className="text-success">
                  {filteredDetails.reduce((total: number, detail: any) => {
                  if (orderType === 'programme') {
                    return total + ((detail.qte_commandee || 0) * (detail.prix || 0));
                  } else {
                    return total + ((detail.quantite || 0) * (detail.prix || detail.prix_unitaire || 0));
                  }
                  }, 0).toLocaleString('fr-FR')} AR
                </strong>
                </td>
              </tr>
              </tfoot>
            </Table>
            </div>
        </div>
        );
      })()}

      {/* Indicateur de chargement */}
      {loadingExpeditions && (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement des livraisons...</span>
          </div>
          <p className="text-muted mt-2">Chargement des informations de livraison...</p>
        </div>
      )}

      {/* Message d'erreur */}
      {errorExpeditions && (
        <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{errorExpeditions}</span>
        </div>
      )}

      {livraisonsByDate.length === 0 ? (
        <div 
          className="text-center py-5 rounded-3"
          style={{ 
            background: "linear-gradient(135deg, #f8fff8 0%, #e8f5e9 100%)",
            border: "2px dashed #c8e6c9"
          }}
        >
          <div className="mb-3">
            <i className="fas fa-box-open" style={{ fontSize: "3rem", color: "#c8e6c9" }}></i>
          </div>
          <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
            <i>Aucune livraison disponible pour le moment.</i>
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {livraisonsByDate.map(([date, docs]) => (
            <div
              key={date}
              className="card p-4 position-relative overflow-hidden"
              style={{ 
                borderRadius: "16px", 
                border: "2px solid #e0f2e0",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)",
                boxShadow: "0 4px 16px rgba(31, 176, 91, 0.08)",
                minHeight: "auto"
              }}
            >
              {/* Pattern décoratif */}
              <div 
                className="position-absolute" 
                style={{ 
                  top: "-50px", 
                  right: "-50px", 
                  width: "150px", 
                  height: "150px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(31, 176, 91, 0.05) 0%, transparent 70%)",
                  pointerEvents: "none"
                }}
              ></div>

              <div className="row g-4 position-relative">
                {docs.map((doc) => (
                  <React.Fragment key={doc.id}>
                    {/* En-tête de la livraison avec timeline */}
                    <div className="col-12">
                      <div 
                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                        style={{ 
                          background: "linear-gradient(135deg, #1FB05B 0%, #17924a 100%)",
                          boxShadow: "0 4px 12px rgba(31, 176, 91, 0.2)"
                        }}
                      >
                        <div 
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)"
                          }}
                        >
                          <FaClipboardCheck className="text-white" style={{ fontSize: "1.5rem" }} />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-white-50 d-block mb-1" style={{ fontSize: "0.75rem" }}>
                            DATE DE LIVRAISON PRÉVUE
                          </small>
                          <h6 className="mb-0 text-white fw-bold" style={{ fontSize: "1.2rem" }}>
                            {doc.date}
                          </h6>
                        </div>
                        <div className="badge bg-white text-success fw-semibold px-3 py-2">
                          <i className="fas fa-calendar-check me-2"></i>
                          Planifiée
                        </div>
                      </div>
                    </div>

                    {/* Informations de livraison avec cards */}
                    <div className="col-md-6">
                      <div 
                        className="h-100 p-3 rounded-3 d-flex align-items-center gap-3"
                        style={{ 
                          backgroundColor: "#fff",
                          border: "1px solid #e0f2e0",
                          boxShadow: "0 2px 8px rgba(31, 176, 91, 0.08)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(31, 176, 91, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(31, 176, 91, 0.08)";
                        }}
                      >
                        <div 
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#e8f5e9",
                            borderRadius: "12px",
                            border: "2px solid #c8e6c9"
                          }}
                        >
                          <FaMapMarkerAlt className="text-success" style={{ fontSize: "1.3rem" }} />
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                            DESTINATION
                          </small>
                          <strong className="text-dark" style={{ fontSize: "1.05rem" }}>
                            {Data?.axe.designation || "Antananarivo"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div 
                        className="h-100 p-3 rounded-3 d-flex align-items-center gap-3"
                        style={{ 
                          backgroundColor: "#fff",
                          border: "1px solid #e0f2e0",
                          boxShadow: "0 2px 8px rgba(31, 176, 91, 0.08)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(31, 176, 91, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(31, 176, 91, 0.08)";
                        }}
                      >
                        <div 
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#e8f5e9",
                            borderRadius: "12px",
                            border: "2px solid #c8e6c9"
                          }}
                        >
                          <FaTruck className="text-success" style={{ fontSize: "1.3rem" }} />
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                          TRANSPORTEUR
                          </small>
                          <strong className="text-dark" style={{ fontSize: "1.05rem" }}>
                          {"Non affecté"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Carte du bon de commande avec design premium */}
                    <div className="col-12">
                      <div 
                        className="card shadow-sm document-card position-relative overflow-hidden"
                        style={{ 
                          borderRadius: "16px", 
                          border: "2px solid #c8e6c9",
                          background: "linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {/* Bandeau supérieur avec effet */}
                        <div 
                          className="position-absolute top-0 start-0 w-100"
                          style={{
                            height: "5px",
                            background: "linear-gradient(90deg, #1FB05B 0%, #17924a 50%, #1FB05B 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 3s infinite"
                          }}
                        ></div>

                        <div className="card-body p-4 pt-5">
                          <div className="row align-items-center g-4">
                            {/* Informations du document */}
                            <div className="col-lg-7">
                              <div className="d-flex align-items-start gap-3 mb-4">
                                <div 
                                  className="document-icon d-flex align-items-center justify-content-center flex-shrink-0 position-relative"
                                  style={{
                                    width: "70px",
                                    height: "70px",
                                    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                                    borderRadius: "16px",
                                    border: "3px solid #1FB05B",
                                    boxShadow: "0 4px 12px rgba(31, 176, 91, 0.2)"
                                  }}
                                >
                                  <img
                                    src={doc_icon}
                                    alt="Document"
                                    style={{ width: 36, height: 36 }}
                                  />
                                  {/* Pulse indicator */}
                                  <span 
                                    className="position-absolute"
                                    style={{
                                      top: "-5px",
                                      right: "-5px",
                                      width: "20px",
                                      height: "20px",
                                      backgroundColor: "#1FB05B",
                                      borderRadius: "50%",
                                      border: "3px solid white",
                                      animation: "pulse 2s infinite"
                                    }}
                                  ></span>
                                </div>
                                <div className="flex-grow-1">
                                  {/* <div className="d-flex align-items-start justify-content-between mb-2">
                                    <h5 className="mb-2 fw-bold text-dark" style={{ fontSize: "1.3rem" }}>
                                      {doc.label}
                                    </h5>
                                    <span 
                                      className="badge bg-success d-flex align-items-center gap-2"
                                      style={{ 
                                        fontSize: "0.85rem", 
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        boxShadow: "0 2px 8px rgba(31, 176, 91, 0.3)"
                                      }}
                                    >
                                      <i className="fas fa-check-circle"></i>
                                      Disponible
                                    </span>
                                  </div> */}
                                  
                                  {/* Informations détaillées avec icônes */}
                                  <div className="d-flex flex-wrap gap-3 mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                      <div 
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          backgroundColor: "#ffebee",
                                          borderRadius: "8px"
                                        }}
                                      >
                                        <i className="fas fa-file-pdf text-danger" style={{ fontSize: "0.9rem" }}></i>
                                      </div>
                                      <small className="text-muted fw-semibold">Format PDF</small>
                                    </div>
                                    {/* <div className="d-flex align-items-center gap-2">
                                      <div 
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          backgroundColor: "#e3f2fd",
                                          borderRadius: "8px"
                                        }}
                                      >
                                        <i className="fas fa-shield-alt text-primary" style={{ fontSize: "0.9rem" }}></i>
                                      </div>
                                      <small className="text-muted fw-semibold">Document sécurisé</small>
                                    </div> */}
                                  </div>
                                  
                                  {/* Actions principales avec design moderne */}
                                  <div className="d-flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-success d-flex align-items-center gap-2 flex-grow-1"
                                      onClick={() => window.open(doc.pdfUrl, "_blank")}
                                      style={{ 
                                        borderRadius: "10px", 
                                        fontWeight: "600",
                                        padding: "10px 20px",
                                        boxShadow: "0 4px 12px rgba(31, 176, 91, 0.3)",
                                        border: "none",
                                        background: "linear-gradient(135deg, #1FB05B 0%, #17924a 100%)"
                                      }}
                                    >
                                      <i className="fas fa-eye"></i>
                                      Prévisualiser
                                    </button>
                                    <a
                                      className="btn btn-outline-success d-flex align-items-center gap-2"
                                      href={doc.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      title="Télécharger"
                                      style={{ 
                                        borderRadius: "10px", 
                                        fontWeight: "600",
                                        padding: "10px 20px",
                                        borderWidth: "2px"
                                      }}
                                    >
                                      <i className="fas fa-download"></i>
                                      Télécharger
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Section informative enrichie */}
                            <div className="col-lg-5">
                              <div 
                                className="h-100 p-4 rounded-3 position-relative overflow-hidden"
                                style={{ 
                                  background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                                  border: "2px solid #a5d6a7",
                                  minHeight: "200px"
                                }}
                              >
                                {/* Icon décoratif en arrière-plan */}
                                <div 
                                  className="position-absolute"
                                  style={{
                                    top: "-20px",
                                    right: "-20px",
                                    fontSize: "120px",
                                    opacity: 0.1,
                                    color: "#1FB05B"
                                  }}
                                >
                                  <i className="fas fa-file-invoice"></i>
                                </div>

                                <div className="position-relative">
                                  <h6 className="text-success mb-3 fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                                    <i className="fas fa-info-circle"></i>
                                    Informations du document
                                  </h6>
                                  
                                  {/* Statut principal */}
                                  <div 
                                    className="p-3 rounded-3 mb-3 bg-white"
                                    style={{ 
                                      boxShadow: "0 2px 8px rgba(31, 176, 91, 0.1)"
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <i className="fas fa-check-circle text-success" style={{ fontSize: "1.2rem" }}></i>
                                      <strong className="text-success">Bon de commande disponible</strong>
                                    </div>
                                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem", paddingLeft: "28px" }}>
                                      Vous pouvez consulter et télécharger le document à tout moment
                                    </p>
                                  </div>

                                  {/* Informations additionnelles */}
                                  <div className="d-flex flex-column gap-2">
                                    <div className="d-flex align-items-start gap-2">
                                      <i className="fas fa-file-alt text-success mt-1" style={{ fontSize: "1rem" }}></i>
                                      <small className="text-dark" style={{ lineHeight: "1.5" }}>
                                        Tous les détails de votre livraison sont inclus dans ce document
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-start gap-2">
                                      <i className="fas fa-lock text-success mt-1" style={{ fontSize: "1rem" }}></i>
                                      <small className="text-dark" style={{ lineHeight: "1.5" }}>
                                        Document officiel validé et sécurisé par SALAMA
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-start gap-2">
                                      <i className="fas fa-print text-success mt-1" style={{ fontSize: "1rem" }}></i>
                                      <small className="text-dark" style={{ lineHeight: "1.5" }}>
                                        Vous pouvez imprimer ce document pour vos archives
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section des actions pour la validation d'état */}
      {(1===1 || user?.role_id === 11) && Data?.etat === 4 && Data?.validationclient === null && Data?.validationsalama === 1 ? (
        <div className="mt-4 d-flex justify-content-end">
          <Button 
            variant="success"
            className="d-flex align-items-center gap-2"
            onClick={handleRequestStateValidation}
            disabled={isValidating}
          >
            <FaCheck />
            {isValidating ? "Finalisation..." : "Finaliser la commande"}
          </Button>
        </div>
      ) : (
        (1===1 || user?.role_id === 11) && Data?.etat === 4 && Data?.validationclient === null && Data?.validationsalama !== 1 && (
          <div className="mt-4">
            <div className="alert alert-warning d-flex align-items-center gap-2">
              <FaCircle style={{ fontSize: '0.7rem' }} />
              <span>La validation finale est en attente de la validation SALAMA.</span>
            </div>
          </div>
        )
      )}

      <ConfirmationPopup
        isVisible={confirmation.isVisible}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.action}
        onCancel={() => setConfirmation(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Modal de confirmation pour la validation d'état */}
      <Modal 
        show={showValidationConfirmation} 
        onHide={handleCancelStateValidation} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaCheck />
            Finalisation de la commande
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaCheck style={{ fontSize: '48px', color: '#1FB05B' }} />
          </div>
          <h5 className="mb-3">Finaliser la commande</h5>
          <p className="text-muted">
            Êtes-vous sûr de vouloir finaliser cette commande ? Cette action marquera la commande comme terminée.
          </p>
          <div className="text-muted small">
            Cette action finalisera définitivement le processus de commande.
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelStateValidation}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirmStateValidation}
            className="px-4"
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Finalisation...</span>
                </div>
                Finalisation...
              </>
            ) : (
              <>
                <FaCheck className="me-1" />
                Confirmer la finalisation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification Popup */}
      {notification.isVisible && (
        <NotificationPopup
          isVisible={notification.isVisible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  </>
  );
};

export default Livraisons;
