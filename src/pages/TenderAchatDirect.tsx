import {  useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import {
    FaRegCalendarAlt,
    FaHashtag,
    FaClock,
    FaBoxOpen
} from "react-icons/fa";

const fakeTenders = [
    {
        id: 3,
        titre: "Fourniture Matériel Médical",
        type: "National",
        reference: "ABC.2025",
        deadline: "30 Juillet 2025",
        publishedDate: "15 juin 2025",
        description: "Appel d'offres pour la fourniture de matériel médical et consommables. Les candidats intéressés sont invités à soumettre leurs propositions avant la date limite.",
        produits: [
            { nom: "Paracétamol", quantite: 10000 },
            { nom: "Amoxicilline", quantite: 5000 }
        ],
        documents: [
            { label: "Contrat cadre", url: "/docs/contrat-cadre.pdf" },
            { label: "Cahier des charges", url: "/docs/cahier-charges.pdf" }
        ],
        devis: [
            { id: 101, date: "25 juin 2025", status: "en attente" },
            { id: 102, date: "27 juin 2025", status: "validé" }
        ],
         soumissions:[
            { id: 5, soumission: "soumission 1", date: "20 juin 2025", status: "en attente" },
            { id: 6, soumission: "soumission 2", date: "22 juin 2025", status: "validé" },
            { id: 7, soumission: "soumission 3", date: "25 juin 2025", status: "rejeté" }
        ]
    },

];



const TenderAchatDirect = () => {
    const { id } = useParams<{ id: string }>();
    const tender = fakeTenders.find(t => t.id === Number(id));



    if (!tender) {
        return <div className="container mt-5 text-danger">❌ Appel d’offre introuvable</div>;
    }

    return (
        <div className="container mt-5">
            <div className="bg-white p-4 rounded-3 shadow-sm border">
                <div className="d-flex align-items-center mb-3">
                    <FaBoxOpen size={24} className="text-primary me-2" />
                    <h3 className="text-primary mb-0">{tender.titre} ({tender.type})</h3>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <p className="mb-1 text-muted"><FaRegCalendarAlt className="me-2" /> Publié : <strong>{tender.publishedDate}</strong></p>
                    </div>
                    <div className="col-md-4">
                        <p className="mb-1 text-muted"><FaHashtag className="me-2" /> Référence : <strong>{tender.reference}</strong></p>
                    </div>
                    <div className="col-md-4">
                        <p className="mb-1 text-danger"><FaClock className="me-2" /> Date limite : <strong>{tender.deadline}</strong></p>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div>

                    {tender.documents?.length > 0 && (
                                <div className="mt-5 mb-5">
                                    <h5 className="text-secondary mb-3">📎 Documents joints</h5>
                                    <ul className="d-flex flex-column gap-1">
                                        {tender.documents.map((doc, index) => (
                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <a
                                                    // href={doc.url}
                                                    href="#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm text-decoration-underline text-theme px-3"
                                                >
                                                     <span className="text-theme " style={{fontSize:"1.3rem"}}>{doc.label}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </div>
                    <div>
                       <Link to={`/formulaireSoumissionNational/${tender.id}`} className="btn btn-outline-primary mt-3">
                            📄 Remplir le formulaire
                       </Link>
                    </div>

                </div>
             <div className="mt-4">
                 <h5 className="text-secondary">historique des soumissions</h5>
                <div className="d-flex flex-column gap-2">
                    <ul className="d-flex flex-column gap-1">
                       {tender.soumissions.map((doc, index) => {
    let statusColor;
    switch (doc.status.toLowerCase()) {
        case 'validé':
            statusColor = 'text-success';
            break;
        case 'rejeté':
            statusColor = 'text-danger'; 
            break;
        case 'en attente':
            statusColor = 'text-primary';
            break;
        default:
            statusColor = 'text-muted'; 
    }

    return (
        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/DetailSoumission/${doc.id}`}>
                <span className="text-theme" style={{ fontSize: "1.3rem" }}>{doc.soumission}</span>
                <small className={`ms-3 ${statusColor}`}>
                    <strong>({doc.status}) <span className="text-muted">({doc.date})</span></strong>
                </small>
            </Link>
        </li>
    );
})}

                    </ul>
                </div>
              </div>
        </div>
        </div>
    );
};

export default TenderAchatDirect;
