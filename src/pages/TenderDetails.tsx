import { useParams } from "react-router-dom";
import { 
  FaClipboardCheck,
  FaHandshake,
  FaCalculator,
  FaFileUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPrint,
  FaDownload,
  FaEye
} from "react-icons/fa";

const fakeTenders = [
  {
    id: 3,
    titre: "Acquisition de Matériel de Laboratoire",
    reference: "LAB.2025",
    deadline: "25 Juillet 2025",
    publishedDate: "10 juillet 2025",
    description:
      "Appel d'offre national pour du matériel de laboratoire. Les fournisseurs doivent garantir la conformité produit et le respect du délai de livraison. Les prix sont basés sur un target price mis à jour dynamiquement.",
    type: "National",
    coefficient: 1.10,
    soumissions: [
      {
        id: 1,
        nom: "Soumission 1",
        etat: "validé",
        produits: [
          { 
            id: 1,
            nom: "Microscope optique", 
            quantite: 20, 
            targetPrice: 750000,
            disponible: 18,
            prix: "720 000 F CFA",
            termeCommercial: "DDP"
          },
          { 
            id: 2,
            nom: "Centrifugeuse", 
            quantite: 10, 
            targetPrice: 1200000,
            disponible: 12,
            prix: "1 150 000 F CFA",
            termeCommercial: "Autre"
          }
        ]
      },
      {
        id: 2,
        nom: "Soumission 2",
        etat: "rejeté",
        produits: [
          { 
            id: 1,
            nom: "Microscope optique", 
            quantite: 20, 
            targetPrice: 750000,
            disponible: 20,
            prix: "750 000 F CFA",
            termeCommercial: "DDP"
          },
          { 
            id: 2,
            nom: "Centrifugeuse", 
            quantite: 10, 
            targetPrice: 1200000,
            disponible: 12,
            prix: "1 000 000 F CFA",
            termeCommercial: "DDP"
          }
        ]
      },
      {
        id: 3,
        nom: "Soumission 3",
        etat: "en attente",
        produits: [
          { 
            id: 1,
            nom: "Microscope optique", 
            quantite: 20, 
            targetPrice: 750000,
            disponible: 50,
            prix: "650 000 F CFA",
            termeCommercial: "Autre"
          },
          { 
            id: 2,
            nom: "Centrifugeuse", 
            quantite: 10, 
            targetPrice: 1200000,
            disponible: 12,
            prix: "1 100 000 F CFA",
            termeCommercial: "DDP"
          }
        ]
      }
    ],
    documents: [
      { label: "Contrat cadre", url: "/docs/contrat-cadre-lab.pdf" },
      { label: "Spécifications techniques", url: "/docs/specs-lab.pdf" }
    ]
  },
  {
    id: 4,
    titre: "Appareils d'Imagerie Médicale",
    reference: "IMG.2025",
    deadline: "20 Juillet 2025",
    publishedDate: "5 juillet 2025",
    description:
      "Appel d'offre international nécessitant la soumission d'un ordre de transit, d'un transitaire (si Autre), et la domiciliation des factures. Le contrôle qualité à la livraison est strict (produits avariés, conformité, etc).",
    type: "International",
    coefficient: 1.15, 
    soumissions: [
      {
        id: 4,
        nom: "Soumission 1",
        etat: "en attente",
        produits: [
          { 
            id: 3,
            nom: "Échographe portable", 
            quantite: 10, 
            targetPrice: 13000000,
            disponible: 8,
            prix: "12 800 000 F CFA",
            termeCommercial: "Autre"
          },
          { 
            id: 4,
            nom: "Scanner 64 barrettes", 
            quantite: 3, 
            targetPrice: 45000000,
            disponible: 2,
            prix: "44 500 000 F CFA",
            termeCommercial: "Autre"
          }
        ]
      },
      {
        id: 5,
        nom: "Soumission 2",
        etat: "rejeté",
        produits: [
          { 
            id: 3,
            nom: "Échographe portable", 
            quantite: 10, 
            targetPrice: 13000000,
            disponible: 10,
            prix: "14 800 000 F CFA",
            termeCommercial: "DDP"
          },
          { 
            id: 4,
            nom: "Scanner 64 barrettes", 
            quantite: 3, 
            targetPrice: 45000000,
            disponible: 2,
            prix: "44 500 000 F CFA",
            termeCommercial: "Autre"
          }
        ]
      },
      {
        id: 6,
        nom: "Soumission 3",
        etat: "validé",
        produits: [
          { 
            id: 3,
            nom: "Échographe portable", 
            quantite: 10, 
            targetPrice: 13000000,
            disponible: 10,
            prix: "11 500 000 F CFA",
            termeCommercial: "Autre"
          },
          { 
            id: 4,
            nom: "Scanner 64 barrettes", 
            quantite: 3, 
            targetPrice: 45000000,
            disponible: 2,
            prix: "43 000 000 F CFA",
            termeCommercial: "Autre"
          }
        ]
      }
    ],
    documents: [
      { label: "Sélection transitaire (si Autre)", url: "/docs/selection-transitaire.pdf" },
      { label: "Formulaire ordre de transit", url: "/docs/ordre-transit.pdf" },
      { label: "Cabinets d'expertise", url: "/docs/cabinets-expertise.pdf" },
      { label: "Formulaire domiciliation facture", url: "/docs/domiciliation.pdf" },
      { label: "Formulaire MIDAC", url: "/docs/midac.pdf" }
    ]
  }
];

const getSubmissionById = (submissionId: number) => {
  for (const tender of fakeTenders) {
    const submission = tender.soumissions?.find(s => s.id === submissionId);
    if (submission) {
      return {
        submission,
        tender,
        dateSubmission: "15 juillet 2025",
        heure: "14:30",
        commentaireTerme: (tender.type === "International" && submission?.produits.some(p => p.termeCommercial === 'Autre')) ? 
          "Livraison prévue dans un délai de 45 jours ouvrables via CIF. Le transitaire sélectionné dispose d'une expérience de 10 ans dans le domaine médical avec certification ISO 9001." : 
          (submission?.produits.some(p => p.termeCommercial === 'Autre') ? "Livraison FOB avec prise en charge des frais de transport locaux." : ""),
        transitaire: tender.type === "International" ? "DHL Supply Chain" : "",
        cabinetExpertise: tender.type === "International" ? "Cabinet EXPERTISE PLUS" : "",
        documentsUploaded: tender.type === "International" ? [
          { nom: "ordre_transit_IMG2025.pdf" },
          { nom: "domiciliation_facture.pdf"},
          { nom: "midac_form.pdf" }
        ] : []
      };
    }
  }
  return null;
};

const SubmissionDetails = () => {
    const { id } = useParams<{ id: string }>();
    const submissionData = getSubmissionById(Number(id));

    if (!submissionData) {
        return <div className="container mt-5 text-danger">Soumission introuvable</div>;
    }

    const { submission, tender, dateSubmission, heure, commentaireTerme, transitaire, cabinetExpertise, documentsUploaded } = submissionData;

    const calculerTotal = () => {
        return submission.produits.reduce((total, produit) => {
            const prixUnitaire = parseFloat(produit.prix.replace(/[^\d]/g, ''));
            const sousTotal = prixUnitaire * Math.min(produit.disponible, produit.quantite);
            const coefficient = (produit.termeCommercial === 'Autre') ? tender.coefficient : 1;
            return total + (sousTotal * coefficient);
        }, 0);
    };

    const getStatusBadge = (status: string) => {
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

    const getTermeBadge = (terme: string) => {
        const termeConfig = {
            'DDP': { class: 'bg-success', text: 'DDP' },
            'Autre': { class: 'bg-warning', text: 'Autre' }
        };
        
        const config = termeConfig[terme as keyof typeof termeConfig] || termeConfig['DDP'];
        
        return (
            <span className={`badge ${config.class}`}>
                {config.text}
            </span>
        );
    };

    const termesUtilises = [...new Set(submission.produits.map(p => p.termeCommercial))];
    const termePrincipal = termesUtilises.length === 1 ? termesUtilises[0] : 'Mixte';

    return (
        <div className="container mt-5">
            <div className="bg-white p-4 rounded-3 shadow-sm border">
                
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h3 className="text-success mb-2">Détail de la Soumission</h3>
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-muted">{submission.nom}</span>
                            <span className="text-muted">•</span>
                            <span className="text-muted">{dateSubmission} à {heure}</span>
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

                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card h-100">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Appel d'Offre</h5>
                            </div>
                            <div className="card-body">
                                <h6 className="text-primary">{tender.titre}</h6>
                                <p className="text-muted mb-2">{tender.description}</p>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <small className="text-muted">Référence:</small>
                                        <div className="fw-bold">{tender.reference}</div>
                                    </div>
                                    <div className="col-sm-6">
                                        <small className="text-muted">Type:</small>
                                        <div className="fw-bold">
                                            <span className={`badge ${tender.type === 'National' ? 'bg-success' : 'bg-primary'}`}>
                                                {tender.type}
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
                                    <div className="fw-bold text-danger">{tender.deadline}</div>
                                </div>
                                <div>
                                    <small className="text-muted">Publié le:</small>
                                    <div className="fw-bold">{tender.publishedDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <br />
                <div className="mb-4">
                    <h5 className="text-success mb-3">
                        <FaHandshake className="me-2" />
                        Termes Commerciaux Sélectionnés
                    </h5>
                    {termePrincipal === 'Mixte' ? (
                        <div className="card border-info">
                            <div className="card-body">
                                <h6 className="card-title text-info">
                                    <FaCheckCircle className="me-2" />
                                    Termes Mixtes
                                </h6>
                                <p className="card-text">
                                    Cette soumission utilise différents termes commerciaux selon les produits :
                                    {termesUtilises.map((terme, index) => (
                                        <span key={terme} className="ms-2">
                                            {getTermeBadge(terme)}
                                            {index < termesUtilises.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>
                                <small className="text-muted">
                                    Voir les détails par produit dans le tableau ci-dessous.
                                </small>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-md-4">
                                <div className={`card ${termePrincipal === 'DDP' ? 'border-success' : 'border-warning'}`}>
                                    <div className="card-body text-center">
                                        <h6 className={`card-title ${termePrincipal === 'DDP' ? 'text-success' : 'text-warning'}`}>
                                            <FaCheckCircle className="me-2" />
                                            {termePrincipal}
                                        </h6>
                                        <p className="card-text small">
                                            {termePrincipal === 'DDP' && 'Delivered Duty Paid - Livré droits acquittés'}
                                            {termePrincipal === 'Autre' && 'Autre terme commercial - Voir commentaire'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {(commentaireTerme && (termePrincipal === 'Autre' || termePrincipal === 'Mixte')) && (
                                <div className="col-md-8">
                                    <div className="card h-100">
                                        <div className="card-header">
                                            <h6 className="mb-0">Commentaire pour {termePrincipal}</h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="mb-0">{commentaireTerme}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {tender.type === "International" && (transitaire || cabinetExpertise) && (
                    <div className="mb-4">
                        <h5 className="text-success mb-3">
                            <FaFileUpload className="me-2" />
                            Sélections Effectuées
                        </h5>
                        <div className="row">
                            {cabinetExpertise && (
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6 className="card-title">Cabinet d'expertise</h6>
                                            <p className="card-text fw-bold text-primary">{cabinetExpertise}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {transitaire && (
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6 className="card-title">Transitaire sélectionné</h6>
                                            <p className="card-text fw-bold text-primary">{transitaire}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {termesUtilises.includes('Autre') && (
                    <div className="alert alert-info d-flex align-items-center mb-4">
                        <FaCalculator className="me-2" />
                        <div>
                            <strong>Coefficient appliqué :</strong> {tender.coefficient}
                            <small className="d-block text-muted">
                                Le coefficient est appliqué individuellement aux produits avec terme "Autre"
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
                                    <th>Qté demandée</th>
                                    <th>Target Price (F CFA)</th>
                                    <th>Qté disponible</th>
                                    <th>Prix unitaire (F CFA)</th>
                                    <th>Terme</th>
                                    <th>Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submission.produits.map((produit) => {
                                    const prixUnitaire = parseFloat(produit.prix.replace(/[^\d]/g, ''));
                                    const sousTotal = prixUnitaire * Math.min(produit.disponible, produit.quantite);
                                    const coefficient = (produit.termeCommercial === 'Autre') ? tender.coefficient : 1;
                                    const sousTotalAvecCoeff = sousTotal * coefficient;
                                    
                                    return (
                                        <tr key={produit.id}>
                                            <td>
                                                <strong>{produit.nom}</strong>
                                            </td>
                                            <td>{produit.quantite.toLocaleString()}</td>
                                            <td className="text-muted">{produit.targetPrice.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${produit.disponible >= produit.quantite ? 'bg-success' : 'bg-warning'}`}>
                                                    {produit.disponible.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {produit.prix}
                                                </span>
                                            </td>
                                            <td>
                                                {getTermeBadge(produit.termeCommercial)}
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
                                    <td colSpan={6}><strong>Total de l'offre</strong></td>
                                    <td><strong className="fs-5">{calculerTotal().toLocaleString()} F CFA</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {tender.type === "International" && documentsUploaded && documentsUploaded.length > 0 && (
                    <div className="mb-4">
                        <div className="card">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">
                                    <FaFileUpload className="me-2" />
                                    Documents Soumis
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {documentsUploaded.map((doc, index) => (
                                        <div key={index} className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center p-3 border rounded">
                                                <FaEye className="text-primary me-3" />
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold">{doc.nom}</div>
                                                </div>
                                                <button className="btn btn-outline-primary btn-sm">
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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

export default SubmissionDetails;