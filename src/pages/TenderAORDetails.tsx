import { useParams } from "react-router-dom";
import { 
  FaClipboardCheck,
  FaCalculator,
  FaFileUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPrint,
  FaDownload,
  FaEye,
  FaCertificate,
  FaInfoCircle,
  FaFileContract
} from "react-icons/fa";

const fakeAORs = [
  {
    id: 5,
    titre: "AOR - Médicaments Essentiels",
    reference: "AOR.MED.2025",
    deadline: "30 Juillet 2025",
    ouvertureOffres: "31 Juillet 2025",
    publishedDate: "15 juillet 2025",
    description: "Accord-cadre sur base de liste préqualifiée pour l'acquisition de médicaments essentiels. Seuls les fournisseurs avec couples produit/fabricant préqualifiés peuvent soumissionner. Les offres doivent respecter les AMM et les spécifications techniques validées.",
    type: "National",
    coefficient: 1.05,
    soumissions: [
      {
        id: 1,
        nom: "Soumission 1",
        etat: "validé",
        termeCommercial: "DDP",
        delaiLivraison: "30 jours",
        validiteOffre: "90 jours",
        dateSubmission: "20 juillet 2025",
        heure: "16:45",
        produits: [
          { 
            id: 1,
            nom: "Paracétamol 500mg", 
            fabricant: "Sanofi",
            quantite: 50000, 
            conditionnement: "Boîte de 20 comprimés",
            targetPrice: 850,
            disponible: 48000,
            prixUnitaire: 820,
            termeCommercial: "DDP",
            prequalifie: true,
            amm: "AMM-2024-001"
          },
          { 
            id: 2,
            nom: "Amoxicilline 250mg", 
            fabricant: "GSK",
            quantite: 20000, 
            conditionnement: "Flacon 60ml",
            targetPrice: 1250,
            disponible: 18500,
            prixUnitaire: 1200,
            termeCommercial: "DDP",
            prequalifie: true,
            amm: "AMM-2023-045"
          }
        ]
      },
      {
        id: 2,
        nom: "Soumission 2",
        etat: "en attente",
        termeCommercial: "AUTRES",
        delaiLivraison: "45 jours",
        validiteOffre: "60 jours",
        commentaireTerme: "Livraison via port de Dakar avec assurance complète",
        dateSubmission: "19 juillet 2025",
        heure: "14:30",
        produits: [
          { 
            id: 1,
            nom: "Paracétamol 500mg", 
            fabricant: "Sanofi",
            quantite: 50000, 
            conditionnement: "Boîte de 20 comprimés",
            targetPrice: 850,
            disponible: 45000,
            prixUnitaire: 750,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "AMM-2024-001"
          },
          { 
            id: 2,
            nom: "Amoxicilline 250mg", 
            fabricant: "GSK",
            quantite: 20000, 
            conditionnement: "Flacon 60ml",
            targetPrice: 1250,
            disponible: 20000,
            prixUnitaire: 1100,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "AMM-2023-045"
          }
        ]
      },
      {
        id: 3,
        nom: "Soumission 3",
        etat: "rejeté",
        termeCommercial: "DDP",
        delaiLivraison: "60 jours",
        validiteOffre: "45 jours",
        dateSubmission: "18 juillet 2025",
        heure: "10:15",
        produits: [
          { 
            id: 1,
            nom: "Paracétamol 500mg", 
            fabricant: "Sanofi",
            quantite: 50000, 
            conditionnement: "Boîte de 20 comprimés",
            targetPrice: 850,
            disponible: 30000,
            prixUnitaire: 900,
            termeCommercial: "DDP",
            prequalifie: false,
            amm: "AMM-2024-001"
          }
        ]
      }
    ]
  },
  {
    id: 6,
    titre: "AOR - Dispositifs Médicaux Stériles",
    reference: "AOR.DMS.2025",
    deadline: "28 Juillet 2025",
    ouvertureOffres: "29 Juillet 2025",
    publishedDate: "12 juillet 2025",
    description: "Accord-cadre international pour dispositifs médicaux stériles. Liste préqualifiée stricte avec fabricants certifiés ISO 13485. Contrôle qualité renforcé à la livraison avec certificats d'analyse obligatoires.",
    type: "International",
    coefficient: 1.12,
    soumissions: [
      {
        id: 4,
        nom: "Soumission 1",
        etat: "validé",
        termeCommercial: "AUTRES",
        delaiLivraison: "35 jours",
        validiteOffre: "120 jours",
        commentaireTerme: "Transport maritime sécurisé avec contrôle température. Transitaire certifié GDP.",
        transitaire: "Kuehne + Nagel",
        cabinetExpertise: "SGS Dakar",
        dateSubmission: "22 juillet 2025",
        heure: "11:20",
        documentsUploaded: [
          { nom: "facture_euromed_aor_dms.pdf" },
          { nom: "packing_list_dispositifs.pdf" },
          { nom: "coa_bd_medical.pdf" },
          { nom: "hawb_kn_transport.pdf" }
        ],
        produits: [
          { 
            id: 3,
            nom: "Seringues jetables 5ml", 
            fabricant: "BD Medical",
            quantite: 100000, 
            conditionnement: "Boîte de 100 unités",
            targetPrice: 2500,
            disponible: 95000,
            prixUnitaire: 2400,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "CE-2024-789"
          },
          { 
            id: 4,
            nom: "Cathéters urinaires", 
            fabricant: "Coloplast",
            quantite: 5000, 
            conditionnement: "Unité stérile",
            targetPrice: 3800,
            disponible: 4800,
            prixUnitaire: 3600,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "CE-2023-456"
          }
        ]
      },
      {
        id: 5,
        nom: "Soumission 2",
        etat: "en attente",
        termeCommercial: "AUTRES",
        delaiLivraison: "40 jours",
        validiteOffre: "90 jours",
        commentaireTerme: "Livraison par voie aérienne avec suivi en temps réel",
        transitaire: "DHL Healthcare",
        cabinetExpertise: "Bureau Veritas",
        dateSubmission: "21 juillet 2025",
        heure: "15:00",
        documentsUploaded: [
          { nom: "facture_medtech_aor.pdf" },
          { nom: "packing_list_complet.pdf" },
          { nom: "lta_authorization.pdf" }
        ],
        produits: [
          { 
            id: 3,
            nom: "Seringues jetables 5ml", 
            fabricant: "BD Medical",
            quantite: 100000, 
            conditionnement: "Boîte de 100 unités",
            targetPrice: 2500,
            disponible: 80000,
            prixUnitaire: 2300,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "CE-2024-789"
          },
          { 
            id: 4,
            nom: "Cathéters urinaires", 
            fabricant: "Coloplast",
            quantite: 5000, 
            conditionnement: "Unité stérile",
            targetPrice: 3800,
            disponible: 5000,
            prixUnitaire: 3500,
            termeCommercial: "AUTRES",
            prequalifie: true,
            amm: "CE-2023-456"
          }
        ]
      }
    ]
  }
];

const getAORSubmissionById = (submissionId:any) => {
  for (const aor of fakeAORs) {
    const submission = aor.soumissions?.find(s => s.id === submissionId);
    if (submission) {
      return {
        submission,
        aor
      };
    }
  }
  return null;
};

const TenderAORDetails = () => {
    const { id } = useParams();
    const submissionData = getAORSubmissionById(Number(id));

    if (!submissionData) {
        return <div className="container mt-5 text-danger">Soumission AOR introuvable</div>;
    }

    const { submission, aor } = submissionData;

    const calculerTotal = () => {
        return submission.produits.reduce((total, produit) => {
            if (produit.prixUnitaire) {
                const sousTotal = produit.prixUnitaire * produit.quantite;
                const coefficient = (produit.termeCommercial !== 'DDP') ? aor.coefficient : 1;
                return total + (sousTotal * coefficient);
            }
            return total;
        }, 0);
    };

    const getStatusBadge = (status:any) => {
        const statusConfig = {
            'en attente': { class: 'bg-warning', icon: FaClock, text: 'En attente' },
            'validé': { class: 'bg-success', icon: FaCheckCircle, text: 'Validé' },
            'rejeté': { class: 'bg-danger', icon: FaTimesCircle, text: 'Rejeté' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['en attente'];
        const IconComponent = config.icon;
        
        return (
            <span className={`badge ${config.class} fs-6 px-3 py-2`}>
                <IconComponent className="me-2" />
                {config.text}
            </span>
        );
    };

    type TermeType = 'DDP' | 'CIF' | 'CIP' | 'AUTRES';
    const getTermeBadge = (terme: TermeType | string) => {
        const termeConfig: Record<TermeType, { class: string; text: string }> = {
            'DDP': { class: 'bg-success', text: 'DDP' },
            'CIF': { class: 'bg-info', text: 'CIF' },
            'CIP': { class: 'bg-secondary', text: 'CIP' },
            'AUTRES': { class: 'bg-warning', text: 'AUTRES' },
        };
        
        const config = termeConfig[terme as TermeType] || termeConfig['DDP'];
        
        return (
            <span className={`badge ${config.class}`}>
                {config.text}
            </span>
        );
    };

    const termesUtilises = ['DDP'];

    return (
        <div className="container mt-5">
            <div className="bg-white p-4 rounded-3 shadow-sm border">
                
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h3 className="text-success mb-2">Détail de la Soumission AOR</h3>
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-muted">{submission.nom}</span>
                            <span className="text-muted">•</span>
                            <span className="text-muted">{submission.dateSubmission} à {submission.heure}</span>
                            <span className="text-muted">•</span>
                            {getStatusBadge(submission.etat)}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm">
                            <FaPrint className="me-1" />
                            Imprimer
                        </button>
                    </div>
                </div>

                <hr className="mb-4"/>

                <div className="alert alert-info">
                    <FaInfoCircle className="me-2" />
                    <strong>AOR - </strong> Réservé aux couples produit/fabricant préqualifiés uniquement.
                </div>

                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card h-100">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">
                                    <FaCertificate className="me-2" />
                                    Appel d'Offre 
                                </h5>
                            </div>
                            <div className="card-body">
                                <h6 className="text-primary">{aor.titre}</h6>
                                <p className="text-muted mb-2">{aor.description}</p>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <small className="text-muted">Référence:</small>
                                        <div className="fw-bold">{aor.reference}</div>
                                    </div>
                                    <div className="col-sm-6">
                                        <small className="text-muted">Type:</small>
                                        <div className="fw-bold">
                                            <span className={`badge ${aor.type === 'National' ? 'bg-success' : 'bg-primary'}`}>
                                                {aor.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Échéances</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <small className="text-muted">Date limite:</small>
                                    <div className="fw-bold text-danger">{aor.deadline}</div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Ouverture offres:</small>
                                    <div className="fw-bold text-warning">{aor.ouvertureOffres}</div>
                                </div>
                                <div>
                                    <small className="text-muted">Publié le:</small>
                                    <div className="fw-bold">{aor.publishedDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <br />


                <div className="mb-4">
                    <h5 className="text-success mb-3">
                        <FaFileContract className="me-2" />
                        Conditions Générales
                    </h5>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-title">Délai de livraison</h6>
                                    <p className="card-text fw-bold text-primary">30 jours</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-title">Validité de l'offre</h6>
                                    <p className="card-text fw-bold text-primary">90 jours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {termesUtilises.some(terme => terme !== 'DDP') && (
                    <div className="alert alert-info d-flex align-items-center mb-4">
                        <FaCalculator className="me-2" />
                        <div>
                            <strong>Coefficient appliqué :</strong> {aor.coefficient}
                            <small className="d-block text-muted">
                                Le coefficient est appliqué individuellement aux produits avec termes AUTRES
                            </small>
                        </div>
                    </div>
                )}

                <br />
                <div className="mb-4">
                    <h5 className="text-success mb-3">
                        <FaClipboardCheck className="me-2" />
                        Détails de l'offre
                    </h5>
                    
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Produit</th>
                                    <th>Fabricant</th>
                                    <th>Quantité</th>
                                    <th>Disponible</th>
                                    <th>Conditionnement</th>
                                    <th>Prix unitaire (F CFA)</th>
                                    <th>Termes</th>
                                    <th>AMM/Certification</th>
                                    <th>Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submission.produits.map((produit) => {
                                    const sousTotal = produit.prixUnitaire * produit.quantite;
                                    const coefficient = (produit.termeCommercial !== 'DDP') ? aor.coefficient : 1;
                                    const sousTotalAvecCoeff = sousTotal * coefficient;
                                    
                                    return (
                                        <tr key={produit.id}>
                                            <td>
                                                <strong>{produit.nom}</strong>
                                            </td>
                                            <td>{produit.fabricant}</td>
                                            <td>{produit.quantite.toLocaleString()}</td>
                                            <td>{produit.disponible.toLocaleString()}</td>
                                            <td>{produit.conditionnement}</td>
                                            <td>
                                                <span >
                                                    {produit.prixUnitaire.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                {getTermeBadge(produit.termeCommercial)}
                                            </td>
                                            <td>
                                                <span className="badge bg-success">
                                                    {produit.amm}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>
                                                    {sousTotalAvecCoeff.toLocaleString()}
                                                </strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="table-success">
                                    <td colSpan={8}><strong>Total de l'offre </strong></td>
                                    <td><strong className="fs-5">{calculerTotal().toLocaleString()} F CFA</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {aor.type === "International" && (
                    <div className="mb-4">
                        <div className="card">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">
                                    <FaFileUpload className="me-2" />
                                    Documents Soumis (Fournisseur Étranger)
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">facture.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">Packing liste.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">COA.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">HAWB.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">LTA.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">Déclaration à l'export.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded">
                                            <FaEye className="text-primary me-3" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">Permis d'exportation.pdf</div>
                                            </div>
                                            <button className="btn btn-outline-primary btn-sm">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <br />
            </div>
        </div>
    );
};

export default TenderAORDetails;