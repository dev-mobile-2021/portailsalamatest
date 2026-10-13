import { Link } from "react-router-dom";
import { FaRegCalendarAlt, FaHashtag, FaClock, FaBoxOpen } from "react-icons/fa";

const TenderTraitement = () => {
  const tender = {
    id: 6,
    titre: "Achat Réactifs de Laboratoire",
    type: "Consultation/cotation",
    reference: "XYZ.2025",
    deadline: "10 Août 2025",
    publishedDate: "01 Juillet 2025",
    dateOuverture: "12 Août 2025 à 09h00",
    status: "traitement",
    soumissions: [
      {
        id: 8,
        soumission: "Offre SantéGlobal",
        date: "05 Août 2025",
        status: "validé",
      },
      {
        id: 9,
        soumission: "Offre BioAfric",
        date: "06 Août 2025",
        status: "en attente",
      },
    ],
  };

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
            <p className="mb-1 text-muted"> Ouverture des offres : <strong>{tender.dateOuverture}</strong></p>
          </div>
        </div>

        <div className="alert alert-warning"> Statut : En cours de traitement</div>

        <div className="mt-4">
          <h5 className="text-secondary"> Analyse des soumissions en cours</h5>
          <p>
            L’équipe SALAMA analyse les offres reçues : évaluation technique (AMM, conditionnement, conformité produits) et évaluation financière (prix unitaires, délais). Le classement est en cours avant la sélection du/des fournisseur(s).
          </p>
        </div>

        <div className="mt-4">
          <h5 className="text-secondary"> Historique des soumissions</h5>
          <ul className="d-flex flex-column gap-3">
            {tender.soumissions.map((s) => (
              <li key={s.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <Link to={`/DetailSoumission/${s.id}`}>
                    <span className="text-theme fs-5">{s.soumission}</span>
                    <small className="ms-3 text-muted"><strong>({s.status})</strong> – {s.date}</small>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TenderTraitement;
