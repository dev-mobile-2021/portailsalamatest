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
        id: 1,
        titre: "Achat Médicaments Essentiels",
        reference: "YHJ.2025",
        deadline: "1 Juillet 2025",
        publishedDate: "20 juin 2025",
        description: "Fourniture de médicaments, consommables et équipements médicaux...",
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
        ]
    },
];
const produits = [
  {
    id: 1,
    nom: 'Paracétamol',
    quantite: 10000,
    disponible: 3000,
    prix: 100,
    etat: 'validé',
  },
  {
    id: 2,
    nom: 'Amoxicilline',
    quantite: 5000,
    disponible: 1200,
    prix: 200,
    etat: 'en attente',
  },
  {
    id: 3,
    nom: 'Ibuprofène',
    quantite: 7500,
    disponible: 300,
    prix: 150,
    etat: 'non validé',
  },
];


const Tender = () => {
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
                    <h3 className="text-primary mb-0">{tender.titre}</h3>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <p className="mb-1 text-muted"><FaRegCalendarAlt className="me-2" /> Publié : <strong>{tender.publishedDate}</strong></p>
                    </div>
                    <div className="col-md-4">
                        <p className="mb-1 text-muted"><FaHashtag className="me-2" /> Référence : <strong>{tender.reference}</strong></p>
                    </div>
                    <div className="col-md-4">
                        <p className="mb-1 text-muted"><FaClock className="me-2" /> Date limite : <strong>{tender.deadline}</strong></p>
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
                       <Link to={`/formulaireSoumission/${tender.id}`} className="btn btn-outline-primary mt-3">
                            📄 Remplir le formulaire
                       </Link>
                    </div>

                </div>
              <div  className="container  ms-0" style={{ maxWidth: '800px' }}>
               <div className="accordion " id="soumissionAccordion">
                <h2 className="text-primary mt-4">🧾 Soumissions</h2>
                    {produits.map((produit) => (
                        <div className="accordion-item" key={produit.id}>
                        <h2 className="accordion-header" id={`heading-${produit.id}`}>
                           
                            <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-${produit.id}`}
                            aria-expanded="false"
                            aria-controls={`collapse-${produit.id}`}
                            >
                             {produit.nom} — <strong className="ms-2 text-muted">{produit.etat}</strong>
                            </button>
                        </h2>
                        <div
                            id={`collapse-${produit.id}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading-${produit.id}`}
                            data-bs-parent="#soumissionAccordion"
                        >
                            <div className="accordion-body">
                            <table className="table table-sm table-bordered mb-0">
                                <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Quantité demandée</th>
                                    <th>Quantité disponible</th>
                                    <th>Prix</th>
                                    <th>Statut</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{produit.nom}</td>
                                    <td>{produit.quantite}</td>
                                    <td>{produit.disponible}</td>
                                    <td>{produit.prix}</td>
                                    <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={produit.etat === 'validé'}
                                        readOnly
                                    />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>

            </div>
        </div>
        </div>
    );
};

export default Tender;
