import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  FaRegCalendarAlt,
  FaHashtag,
  FaClock,
  FaBoxOpen,
  FaClipboardCheck,
  FaCertificate,
  FaCheckCircle,
  FaFileAlt
} from "react-icons/fa";
import { useAOContext } from "../context/AOContext";



const TenderAOR = () => {
  

  const {aos } = useAOContext();

const { id } = useParams<{ id: string }>();
  const aor = aos.find(a => a.id === (id));
  const navigate = useNavigate();
  if (!aor) {
    return <div className="container mt-5 text-danger">AOR introuvable</div>;
  }

  return (
    
    <div className="container mt-5">
      <div className="bg-white p-4 rounded-3 shadow-sm border">
        <div className="d-flex align-items-center mb-3">
          <FaCertificate size={24} className="text-success me-2" />
          <h3 className="text-success mb-0">{aor.designation}</h3>
          <span className={`badge ms-3 ${aor.typemarche.designation === 'International' ? 'bg-info' : 'bg-success'}`}>
            {aor.typemarche.designation}
          </span>
        </div>

        <br />

        <div className="row mb-3">
          <div className="col-md-3">
            <p className="mb-1 text-muted">
              <FaRegCalendarAlt className="me-2" /> Publié : <strong>{aor.datepublication}</strong>
            </p>
          </div>
          <div className="col-md-3">
            <p className="mb-1 text-muted">
              <FaHashtag className="me-2" /> Référence : <strong>{aor.reference}</strong>
            </p>
          </div>
          <div className="col-md-3">
            <p className="mb-1 text-muted">
              <FaClock className="me-2" /> Fin soumission : <strong>{aor.date}</strong>
            </p>
          </div>
          <div className="col-md-3">
            <p className="mb-1 text-muted">
              <FaBoxOpen className="me-2" /> Ouverture : <strong>{aor.date}</strong>
            </p>
          </div>
        </div>
        <hr />

        <p className="text-dark mb-4">{aor.etat_text}</p>
        <br />

        {aor.attachments?.length > 0 && (
          <div className="mt-4 mb-4">
            <h5 className="text-secondary mb-3"><FaFileAlt className="mb-1" /> Documents joints</h5>
            <div className="row">
              {aor.attachments.map((doc, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline-success btn-sm w-100">
                    <FaFileAlt className="me-2" />
                    {doc.designation}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-end">
          <Link to={`/formulaireAOR/${aor.id}`} className="btn btn-success mt-4 btn-lg">
            <FaClipboardCheck className="me-2" />
            Remplir le formulaire de soumission
          </Link>
        </div>
        <br />

        <div className="container ms-0" style={{ maxWidth: '800px' }}>
          <div className="accordion" id="soumissionAccordion">
            <h2 className="text-success mt-4">🧾 Soumissions AOR</h2>
            {aor.soumissions?.map((soumission) => (
              <div className="accordion-item" key={soumission.id}>
                <h2 className="accordion-header" id={`heading-soumission-${soumission.id}`}>
                  <button
                    className="accordion-button collapsed d-flex justify-content-between align-items-center"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-soumission-${soumission.id}`}
                    aria-expanded="false"
                    aria-controls={`collapse-soumission-${soumission.id}`}
                  >
                    <div className="d-flex align-items-center">
                      <span>{soumission.fournisseur?.nom}</span>
                      <span className={`badge ms-3 ${soumission.statut === 'validé' ? 'bg-success' :
                          soumission.statut === 'rejeté' ? 'bg-danger' :
                            soumission.statut === 'en cours' ? 'bg-info' : 'bg-warning'
                        }`}>
                        {soumission.statut}
                      </span>
                    </div>
                    <div className="d-flex align-items-center ms-auto">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Voir détails de ${soumission.fournisseur?.nom}`);
                          navigate(`/tenderAORDetails/${soumission.id}`);
                        }}
                      >
                        Voir détails
                      </button>
                    </div>
                  </button>
                </h2>
                <div
                  id={`collapse-soumission-${soumission.id}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-soumission-${soumission.id}`}
                  data-bs-parent="#soumissionAccordion"
                >
                  <div className="accordion-body">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Fabricant</th>
                          <th>Quantité demandée</th>
                          <th>Quantité disponible</th>
                          <th>Prix unitaire</th>
                          <th>AMM/Cert.</th>
                          <th>Préqualifié</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soumission.soumissionarticles?.map((produit) => (
                          <tr key={produit.id}>
                            <td>{produit.article.designation}</td>
                            <td><strong>{produit.fabricant.designation}</strong></td>
                            <td>{produit.article.quantite}</td>
                            <td>{produit.prixunitairepropose}</td>
                            <td>{produit.article.prix}</td>
                            <td>
                              <span className="badge bg-primary text-white">{produit.observationsaq}</span>
                            </td>
                            <td>
                              {produit.prequalification ? (
                                <FaCheckCircle className="text-success" title="Préqualifié" />
                              ) : (
                                <span className="text-danger">Non</span>
                              )}
                            </td>
                          </tr>
                        ))}
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

export default TenderAOR;