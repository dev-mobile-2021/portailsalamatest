import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useUserhook";
import { Commande } from "../types/Campagne.types";
import { Commande as NewCommande } from "../types/Commande.types";
import { useCommande } from "../hooks/useCommandes";
import backIcon from "../assets/images/back.png";
import { mockCommande } from "../mocks/commandeMock";
import VueGlobale from "../components/tabs/VueGlobale";
import Livraisons from "../components/tabs/Livraisons";
import FactureProforma from "../components/tabs/FactureProforma";
import { useState, useEffect, useCallback, SetStateAction } from "react";
import { Container } from "react-bootstrap";
import BonCommande from "../components/tabs/BonCommande";
import Facture from "../components/tabs/Facture";
import Spiner from "../components/const/Spiner";


// Définir le type de commande
type FilterType = 'programme' | 'rc_public' | 'rc_prive' | 'tef' | 'be' | 'ferme' | 'urgence' | 'enlevement';

// Fonction pour obtenir le libellé du type de commande
const getFilterTypeLabel = (type: FilterType): string => {
    switch(type) {
        case 'programme': return 'Commande Programme';
        case 'rc_public': return 'Commande RC Public';
        case 'rc_prive': return 'Commande RC Privé';
        case 'tef': return 'Commande TEF';
        case 'be': return 'Commande BE';
        case 'ferme': return 'Commande Ferme';
        case 'urgence': return "Commande D'urgence";
        case 'enlevement': return 'Commande Enlèvement';
        default: return '';
    }
};

// Fonction pour mapper la nouvelle commande vers l'ancien format
const mapNewCommandeToOldCommande = (newCommande: NewCommande): Commande | null => {
    // Vérification défensive : si newCommande est null/undefined, retourner null
    if (!newCommande) {
        console.warn("mapNewCommandeToOldCommande: newCommande est null ou undefined");
        return null;
    }
    
    // Vérification défensive pour lignecommandes
    const lignecommandes = newCommande.lignecommandes || [];
    
    return {
        id: newCommande.id,
        codedevis: newCommande.codedevis,
        codeproforma_agence: newCommande.codeproforma_agence,
        codeproforma_central: newCommande.codeproforma_central,
        validationclient_ral_etape1: newCommande.validationclient_ral_etape1 ?? null,
        validationsalama_ral_etape1: newCommande.validationsalama_ral_etape1 ?? null,
        validationclient_ral_etape2: newCommande.validationclient_ral_etape2 ?? null,
        validation_dm_ral_etape2: newCommande.validation_dm_ral_etape2 ?? null,
        validation_dvm_ral_etape2: newCommande.validation_dvm_ral_etape2 ?? null,
        datecommande: newCommande.datecommande,
        commentaire: newCommande.commentaire,
        datereception: '', // Pas disponible dans la nouvelle API
        statut: newCommande.statut ,
        client_id: newCommande.client_id,
        etat:  (newCommande.statut) ,
        validationclient: newCommande.validationclient,
        validationsalama: newCommande.validationsalama,
        etat_cd_text: newCommande.etat_cd_text,
        etat_cd_badge: newCommande.etat_cd_badge,
        etat_commande: newCommande.etat_commande,
        etat_text: newCommande.etat_text,
        dateprevulivraison: newCommande.dateprevulivraison,
        typelivraison_id: newCommande.typecommande_id,
        client: {
            id: newCommande.client?.id || newCommande.client_id,
            designation: newCommande.client?.designation || 'Client non spécifié',
            telfixe: '',
            telmobile: '',
            region: '',
            district: '',
            categorieclient_id: 0,
            user_id: 0,
            created_at: '',
            created_at_fr: '',
            updated_at: '',
            updated_at_fr: '',
            deleted_at: '',
            deleted_at_fr: '',
            axe: newCommande.client?.axe
        },
        qte_debut: 0,
        qte_fin: 0,
        detailcommandes: lignecommandes.map(ligne => ({
            id: ligne.id,
            etat: ligne.etat,
            is_ral: ligne.is_ral ?? false,
            etat_ral: ligne.etat_ral ?? 0,
            etat_ral_text: ligne.etat_ral_text || '',
            etat_ral_badge: ligne.etat_ral_badge || '',
            article_id: ligne.article?.id || 0,
            quantite: ligne.quantite,
            prix:  parseFloat(ligne.prix || '0') ,
            avg: ligne.cmm,
             remisepourcentage: ligne.remisepourcentage || null,
            // Mapping des détails de lots
            detaillignecommandes: ligne.detaillignecommandes || [],
            article: ligne.article ? {
                id: ligne.article.id,
                designation: ligne.article.designation,
                prix: parseFloat(ligne.prix || '0'),
                quantite: ligne.quantite,
                description: ligne.article_text || '',
                categorie_id: ligne.famille_id || 0,
                image: '',
                code: '',
                unite_id: 0,
                categorie: ligne.famille ? {
                    id: ligne.famille.id,
                    designation: ligne.famille.designation,
                    description: ''
                } : {
                    id: 0,
                    designation: 'Non spécifié',
                    description: ''
                },
                unite: {
                    id: 0,
                    designation: 'Non spécifié',
                    description: ''
                }
            } : {
                id: 0,
                designation: ligne.article_text || 'Article non spécifié',
                prix: parseFloat(ligne.prix || '0'),
                quantite: ligne.quantite,
                description: ligne.article_text || '',
                categorie_id: ligne.famille_id || 0,
                image: '',
                code: '',
                unite_id: 0,
                categorie: {
                    id: 0,
                    designation: 'Non spécifié',
                    description: ''
                },
                unite: {
                    id: 0,
                    designation: 'Non spécifié',
                    description: ''
                }
            },
            produit: ligne.article?.designation || ligne.article_text,
            code: ligne.article?.code || '',
            unite: ligne.article?.unite?.designation || 'Non spécifié',
            qte_demandee: ligne.quantite,
            qte_debut: ligne.qte_debut,
            lot: ligne.source_lot || '',
            date_peremption: ligne.dateperemption || '',
            cmm: ligne.cmm,
            stock_max: ligne.stock_max,
            qte_commander_l: ligne.qte_commandee,
            qte_commandee: ligne.qte_commandee,
            nb_jour_rupture: ligne.nb_jour_rupture,
            msd: ligne.msd,
            qte_transferes: ligne.qte_transferes,
            qte_dfs: ligne.qte_dfs,
            qte_recue: ligne.qte_recue,
            qte_distribuee: ligne.qte_distribuee,
            qte_perdue: ligne.qte_perdue,
            ajustement: ligne.ajustement,
            qte_finale: ligne.qte_fin,
            catalogue: ligne.catalogue  ,
            famille_id: ligne.famille_id
        })),
        typelivraison: {
            id: newCommande.typecommande?.id || newCommande.typecommande_id,
            designation: newCommande.typecommande?.designation || 'Type non spécifié',
            description: newCommande.typecommande?.designation || 'Type non spécifié'
        },
        campagne: newCommande.campagne ? {
            id: newCommande.campagne.id,
            date: newCommande.campagne.date || '',
            designation: newCommande.campagne.designation,
            statut: newCommande.campagne.statut || '',
            programme_id: newCommande.campagne.programme_id || '',
            phasedepots: newCommande.campagne.phasedepots || [],
            image: newCommande.campagne.image || '',
            lignecommandes: newCommande.campagne.lignecommandes || [],
            etat_badge: newCommande.campagne.etat_badge || '',
            etat_text: newCommande.campagne.etat_text || '',
            datefin: newCommande.campagne.datefin || '',
            programme: newCommande.campagne.programme ? {
                id: newCommande.campagne.programme.id,
                designation: newCommande.campagne.programme.designation,
                equipegestion_id: newCommande.campagne.programme.equipegestion_id || '',
                objectif: newCommande.campagne.programme.objectif || '',
                missions: newCommande.campagne.programme.missions || '',
                date: newCommande.campagne.programme.date || '',
                equipegestion: newCommande.campagne.programme.equipegestion ? {
                    id: newCommande.campagne.programme.equipegestion.id,
                    designation: newCommande.campagne.programme.equipegestion.designation,
                    description: newCommande.campagne.programme.equipegestion.description || '',
                    personnels: newCommande.campagne.programme.equipegestion.personnels || []
                } : {
                    id: 0,
                    designation: '',
                    description: '',
                    personnels: []
                },
                lignecommandes: newCommande.campagne.programme.lignecommandes || []
            } : {
                id: 0,
                designation: '',
                equipegestion_id: '',
                objectif: '',
                missions: '',
                date: '',
                equipegestion: {
                    id: 0,
                    designation: '',
                    description: '',
                    personnels: []
                },
                lignecommandes: []
            }
        } : {
            id: 0,
            date: '',
            designation: 'Campagne non spécifiée',
            statut: '',
            programme_id: '',
            phasedepots: [],
            image: '',
            lignecommandes: [],
            etat_badge: '',
            etat_text: '',
            datefin: '',
            programme: {
                id: 0,
                designation: '',
                equipegestion_id: '',
                objectif: '',
                missions: '',
                date: '',
                equipegestion: {
                    id: 0,
                    designation: '',
                    description: '',
                    personnels: []
                },
                lignecommandes: []
            }
        },
        etat_badge: 'bg-info',
    };
};

const DetailOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    
    // Récupérer le type de commande depuis l'URL
    const [orderType, setOrderType] = useState<FilterType | null>(null);
    const [activeTab, setActiveTab] = useState<"Vue globale" | "facture proformat" | "Bon de commande" | "Reception" | "Facture" >("Vue globale");

    // Extraire le type de commande depuis les paramètres d'URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const typeParam = params.get('type') as FilterType | null;
        if (typeParam) {
            setOrderType(typeParam);
        }
    }, [location.search]);

    // Utiliser le nouveau hook pour récupérer la commande
    const { commande: newCommande, loading: loadingNewCommande, error, refetch: refetchCommande } = useCommande(
        Number(id) || 0, 
        user?.client_id
    );

    const useMockData = false; // Désactiver les mocks par défaut
    const [commandeData, setCommandeData] = useState<Commande | null>(
        useMockData ? mockCommande : null,
    );

    useEffect(() => {
        if (useMockData) {
            setCommandeData(mockCommande);
            return;
        }

        if (!newCommande) {
            return;
        }

        const mappedCommande = mapNewCommandeToOldCommande(newCommande);
        if (mappedCommande) {
            setCommandeData(mappedCommande);
        }
    }, [newCommande, useMockData]);

    const refreshCommandeData = useCallback(async () => {
        if (useMockData) {
            return;
        }

        const refreshed = await refetchCommande();
        if (!refreshed) {
            return;
        }

        const mappedCommande = mapNewCommandeToOldCommande(refreshed as NewCommande);
        if (mappedCommande) {
            setCommandeData(mappedCommande);
        }
    }, [refetchCommande, useMockData]);

    const handleSetCommandeData = useCallback((updatedData: SetStateAction<Commande | null>) => {
        setCommandeData((previousData) => (
            typeof updatedData === "function"
                ? (updatedData as (prevState: Commande | null) => Commande | null)(previousData)
                : updatedData
        ));
    }, []);

    const commande = commandeData ? [commandeData] : null;

    // Loading state
    if (loadingNewCommande) {
        return <Spiner />;
    }

    // Error handling amélioré
    if (error) {
        console.error("Erreur lors du chargement de la commande:", error);
        return (
            <Container fluid className="p-4">
                <div className="alert alert-danger">
                    <h5><i className="fas fa-exclamation-triangle me-2"></i>Erreur de chargement</h5>
                    <p className="mb-3">Impossible de charger les détails de la commande.</p>
                    <p className="text-muted small mb-3">Détail: {typeof error === 'string' ? error : 'Erreur inconnue'}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fas fa-arrow-left me-2"></i>Retour
                    </button>
                </div>
            </Container>
        );
    }

    // Early returns après tous les hooks
    if (!user?.login) return null;
    
    // Vérification améliorée des données de commande
    if (!commande || commande.length === 0 || !commande[0]) {
        return (
            <Container fluid className="p-4">
                <div className="alert alert-warning">
                    <h5><i className="fas fa-search me-2"></i>Commande non trouvée</h5>
                    <p className="mb-3">Les données de cette commande ne sont pas disponibles.</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fas fa-arrow-left me-2"></i>Retour
                    </button>
                </div>
            </Container>
        );
    }
    
    // Vérification défensive pour detailcommandes
    if (!commande[0].detailcommandes) {
        commande[0].detailcommandes = [];
    }
    
    // Déboguer les données utilisées
    // console.log("Données de commande utilisées:", commande);
    // console.log("Type de commande:", orderType);
    // console.log("Nouvelle commande:", newCommande);

    // État de la commande (1-5)
    const commandeEtat = commande[0]?.etat || 1;
    const commandeEtatCommande = commande[0]?.etat_commande || 0;
    
    // Log de débogage pour les commandes programme
    if (orderType === 'programme') {
        console.log("📊 Commande Programme - État:", commandeEtat, "État Commande:", commandeEtatCommande);
        console.log("🔓 Accès Réception:", commandeEtatCommande >= 1 ? "OUI" : "NON");
    }

    // Configuration des étapes du stepper
    const steps = orderType === 'programme' 
        ? [
            { 
                id: 1, 
                label: "Vue globale", 
                value: "Vue globale" as const, 
                icon: "fa-eye", 
                etatRequis: 1,
                etatCommandeRequis: 0, // Pas de condition spécifique
                description: "Vue d'ensemble de la commande"
            },
            { 
                id: 4, 
                label: "Réception", 
                value: "Reception" as const, 
                icon: "fa-truck", 
                etatRequis: 1, // Accessible dès l'état 1 pour les commandes programme
                etatCommandeRequis: 1, // Condition: etat_commande doit être à 1
                description: "Réception et vérification des articles"
            }
          ]
        : [
            { 
                id: 1, 
                label: "Vue globale", 
                value: "Vue globale" as const, 
                icon: "fa-eye", 
                etatRequis: 1,
                etatCommandeRequis: 0,
                description: "Vue d'ensemble de la commande"
            },
            { 
                id: 2, 
                label: "Facture Proforma", 
                value: "facture proformat" as const, 
                icon: "fa-file-invoice", 
                etatRequis: 2,
                etatCommandeRequis: 0,
                description: "Facture proforma en attente de validation"
            },
            { 
                id: 3, 
                label: "Bon de Commande", 
                value: "Bon de commande" as const, 
                icon: "fa-shopping-cart", 
                etatRequis: 3,
                etatCommandeRequis: 0,
                description: "Bon de commande validé"
            },
            { 
                id: 4, 
                label: "Réception", 
                value: "Reception" as const, 
                icon: "fa-truck", 
                etatRequis: 4,
                etatCommandeRequis: 0,
                description: "Livraison et réception des articles"
            },
            { 
                id: 5, 
                label: "Facture", 
                value: "Facture" as const, 
                icon: "fa-receipt", 
                etatRequis: 5,
                etatCommandeRequis: 0,
                description: "Facture finale émise"
            }
          ];

    const handleTabChange = (tab: "Vue globale" | "facture proformat" | "Bon de commande" | "Reception" | "Facture", etatRequis: number, etatCommandeRequis: number) => {
        // Pour les commandes de type programme avec l'onglet Réception
        if (orderType === 'programme' && tab === 'Reception') {
            // Accessible si etat_commande est à 1
            if (commandeEtatCommande >= etatCommandeRequis) {
                setActiveTab(tab);
            }
        } else {
            // Vérifier si l'étape est accessible (logique standard)
            if (commandeEtat >= etatRequis) {
                setActiveTab(tab);
            }
        }
    };

    return (
        <Container fluid className="p-0" style={{  zoom: 0.7 }}>
            <div className="bg-white p-4 rounded">
                {/* Header with back button */}
                <div className="d-flex align-items-center mb-4 justify-content-between gap-1">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn bg-success rounded-2 border-none px-2 py-2"
                            onClick={() => navigate(-1)}
                        >
                            <img src={backIcon} className="icon-size w-75" alt="Back" />
                        </button>
                        {orderType && (
                            <div className="badge bg-success p-2 fs-6">
                                Type: {getFilterTypeLabel(orderType)}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Stepper progressif */}
                <div className="stepper-container mb-4">
                    
                    <div className="stepper-wrapper">{steps.map((step, index) => {
                            const isActive = activeTab === step.value;
                            
                            // Logique d'accessibilité pour les commandes programme
                            let isAccessible;
                            let isCompleted;
                            
                            if (orderType === 'programme' && step.value === 'Reception') {
                                // Pour la réception dans une commande programme, vérifier etat_commande
                                isAccessible = commandeEtatCommande >= step.etatCommandeRequis;
                                isCompleted = commandeEtatCommande > step.etatCommandeRequis;
                            } else {
                                // Logique standard basée sur l'état de la commande
                                isAccessible = commandeEtat >= step.etatRequis;
                                isCompleted = commandeEtat > step.etatRequis;
                            }
                            
                           const isLocked = !isAccessible;

                            return (
                                <div key={step.id} className="stepper-item-wrapper">
                                    {/* Étape */}
                                    <div
                                        className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => handleTabChange(step.value, step.etatRequis, step.etatCommandeRequis)}
                                        style={{ cursor: isAccessible ? 'pointer' : 'not-allowed' }}
                                        title={isLocked ? `🔒 Cette étape n'est pas encore accessible` : `✅ ${step.description}`}
                                    >
                                        <div className="stepper-circle">
                                            {isCompleted ? (
                                                <i className="fas fa-check"></i>
                                            ) : isLocked ? (
                                                <i className="fas fa-lock"></i>
                                            ) : (
                                                <i className={`fas ${step.icon}`}></i>
                                            )}
                                            {/* Badge avec numéro d'étape */}
                                            <span className="stepper-badge">{step.id}</span>
                                        </div>
                                        <div className="stepper-label">
                                            {step.label}
                                            {isActive && <i className="fas fa-chevron-down ms-1 stepper-arrow"></i>}
                                        </div>
                                      
                                    </div>
                                    
                                    {/* Ligne de connexion */}
                                    {index < steps.length - 1 && (
                                        <div className={`stepper-line ${isCompleted ? 'completed' : ''}`}>
                                            <div className="stepper-line-progress"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tab content adapté selon le type de commande */}
                {activeTab === "Vue globale" && (
                    <VueGlobale
                        Data={commande[0]}
                        user={user}
                        orderType={orderType}
                        setData={handleSetCommandeData}
                        onRefreshCommande={refreshCommandeData}
                        dashboardData={{ documentsAConsulter: [], documentsFournis: [] }}
                        fournisseurs={[]}
                        loadingFabricants={false}
                        errorFabricants={null}
                        handleSubmit={(e) => {
                            e.preventDefault();
                            console.log("Form submitted:", commande[0]);
                            return Promise.resolve();
                        }}
                    />
                )}

                {activeTab === "facture proformat" && (
                    <FactureProforma  
                        user= {user}
                        orderType={orderType}
                        Data={commande[0]}
                        setData={handleSetCommandeData}
                        onRefreshCommande={refreshCommandeData}
                        onGoToVueGlobale={() => setActiveTab("Vue globale")}
                        data={{
                            numero: `${commande[0]?.id || "0000"}`,
                            // etat_texte: commande[0]?.etat_texte || '',
                            date_emission: commande[0]?.datecommande || new Date().toISOString(),
                            statut: typeof commande[0]?.statut === 'number' 
                                ? commande[0]?.statut === 1 ? 'validée' : 'en attente validation' 
                                : 'en attente validation',
                            etat: commande[0]?.etat || 0,
                            validationclient: commande[0]?.validationclient || null,
                            validationsalama: commande[0]?.validationsalama || null,
                            codeproforma_agence: commande[0]?.codeproforma_agence ,
                            codeproforma_central: commande[0]?.codeproforma_central ,
                            type_commande: orderType || undefined,
                            articles: commande[0]?.detailcommandes
                            ?.filter(item => item?.etat||-2 >= 2 || item.etat === -2) 
                            .map(item => ({
                                id_ligne: item.id|| 0,
                                etat: item.etat,
                                is_ral: item.is_ral ?? 0,
                                etat_ral: item.etat_ral ?? 0,
                                etat_ral_text: item.etat_ral_text || '',
                                etat_ral_badge: item.etat_ral_badge || '',
                                lot: item.lot || '',
                                sourceLot: item.lot || '',
                                code: item.article?.code || item.code || '',
                                designation: item.article?.designation || item.produit || '',
                                remise: item?.remisepourcentage || 0,
                                fabricant: 'Non spécifié',
                                quantite: item.quantite || 0,
                                prix_unitaire: item.prix || 0,
                                date_peremption: item.date_peremption ||  '2030-12-31',
                                montant: (item.prix || 0) * (item.quantite || 0)
                            })) || [],
                            totaux: {
                                ht: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0,
                                imp: 0, // Calculer les impôts si nécessaire
                                ttc: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0
                            },
                            // Ajouter encours uniquement pour les commandes RC
                            ...(orderType === 'rc_prive' ? {
                                encours: {
                                    autorise: 5000000, // Valeur par défaut
                                    reel: 3500000 // Valeur par défaut
                                }
                            } : {}),
                            alertes: {
                                encours_depasse: false,
                                rupture_stock: false,
                                peremption_proche: false
                            }
                        }}
                    />
                )}
                
                {activeTab === "Bon de commande" && (
                    <BonCommande
                        user={user}
                        orderType={orderType}
                        Data={commande[0]}
                        setData={handleSetCommandeData}
                        data={{
                            numero: `${commande[0]?.id || "0000"}`,
                            etat: commande[0]?.etat || 0,
                            validationclient: commande[0]?.validationclient || null,
                            validationsalama: commande[0]?.validationsalama || null,
                            date_emission: commande[0]?.datecommande || new Date().toISOString(),
                            statut: typeof commande[0]?.statut === 'number' 
                                ? commande[0]?.statut === 1 ? 'validée' : 'en attente validation' 
                                : 'en attente validation',
                            type_commande: orderType || undefined,
                            articles: commande[0]?.detailcommandes?.map(item => ({
                                id_ligne: item.id|| 0,
                                etat: item.etat,
                                is_ral: item.is_ral ?? 0,
                                etat_ral: item.etat_ral ?? 0,
                                etat_ral_text: item.etat_ral_text || '',
                                etat_ral_badge: item.etat_ral_badge || '',
                                lot: item.lot || '',
                                sourceLot: item.lot || '',
                                code: item.article?.code || item.code || '',
                                designation: item.article?.designation || item.produit || '',
                                fabricant: 'Non spécifié',
                                quantite: item.quantite || 0,
                                prix_unitaire: item.prix || 0,
                                date_peremption: item.date_peremption || '2025-12-31',
                                montant: (item.prix || 0) * (item.quantite || 0)
                            })) || [],
                            totaux: {
                                ht: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0,
                                imp: 0,
                                ttc: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0
                            }
                        }}
                    />
                )}

                {activeTab === "Reception" && (
                    <Livraisons 
                        orderType={orderType}
                        Data={{
                            numero: `${commande[0]?.id || "0000"}`,
                            date_emission: commande[0]?.datecommande || new Date().toISOString(),
                            date_livraison: commande[0]?.datereception || new Date().toISOString(),
                            validationclient: commande[0]?.validationclient || null,
                            validationsalama: commande[0]?.validationsalama || null,
                            etat: commande[0]?.etat || 0,
                            statut: typeof commande[0]?.statut === 'number' 
                                ? commande[0]?.statut === 1 ? 'validée' : 'en attente validation' 
                                : 'en attente validation',
                            type_commande: orderType || undefined,
                            articles: commande[0]?.detailcommandes?.map(item => ({
                                code: item.article?.code || item.code || '',
                                designation: item.article?.designation || item.produit || '',
                                quantite_commandee: item.quantite || 0,
                                quantite_recue: item.qte_recue || 0,
                                id_ligne: item.id|| 0,
                                sourceLot: item.lot || '',
                                date_peremption: item.date_peremption || '2025-12-31'
                            })) || [],
                            axe: commande[0]?.client?.axe || null
                            
                        }}
                        data={commande[0]}
                        user={user}
                    />
                )}
                
                {/* Facture - conditionnellement affichée selon l'onglet actif */}
                {activeTab === "Facture" && (
                    <Facture 
                        orderType={orderType}
                        data={{
                            numero: `${commande[0]?.id || "0000"}`,
                            date_emission: commande[0]?.datecommande || new Date().toISOString(),
                            date_echeance: (() => {
                                // Ajouter 30 jours à la date d'émission pour la date d'échéance
                                const date = new Date(commande[0]?.datecommande || new Date());
                                date.setDate(date.getDate() + 30);
                                return date.toISOString();
                            })(),
                            statut: typeof commande[0]?.statut === 'number' 
                                ? commande[0]?.statut === 1 ? 'validée' : 'en attente validation' 
                                : 'en attente validation',
                            type_commande: orderType || undefined,
                            articles: commande[0]?.detailcommandes?.map(item => ({
                                code: item.article?.code || item.code || '',
                                designation: item.article?.designation || item.produit || '',
                                fabricant: 'Non spécifié',
                                quantite: item.quantite || 0,
                                prix_unitaire: item.prix || 0,
                                date_peremption: item.date_peremption || '2025-12-31',
                                montant: (item.prix || 0) * (item.quantite || 0)
                            })) || [],
                            totaux: {
                                ht: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0,
                                imp: 0,
                                ttc: commande[0]?.detailcommandes?.reduce((acc, item) => 
                                    acc + ((item.prix || 0) * (item.quantite || 0)), 0) || 0
                            },
                            paiement: {
                                methode: 'Virement bancaire',
                                statut: 'En attente',
                                delai: '30 jours'
                            }
                        }}
                    />
                )}
            </div>
        </Container>
    );
};

export default DetailOrders;