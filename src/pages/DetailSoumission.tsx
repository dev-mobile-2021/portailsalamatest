
    import { useParams } from "react-router-dom"


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
];

const soumissions = [
  {
    id: 5,
    fournisseur: "PharmaGlobal SARL",
    dateSoumission: "2025-07-29",
    devis: "devis-pharma.pdf",
    incoterm: "CIF",
    commentaire: "Livraison via le port de Dakar sous 15 jours",
    produits: [
      { nom: "Paracétamol", quantite: 10000, prix: 25 },
      { nom: "Amoxicilline", quantite: 5000, prix: 45 },
    ],
    documents: {
      amm: "certificat_AMM.pdf",
      coa: "analyse_produit.pdf",
      planning: "planning_livraison.pdf",
      devis: "devis-pharma.pdf",
    },
    livraison: {
      adresse: "Zone Industrielle, Dakar",
      delai: "15 jours",
      mode: "Maritime",
      dateExpedition: "2025-08-10",
    },
  },
  {
    id: 6,
    fournisseur: "SantéPlus International",
    dateSoumission: "2025-07-30",
    devis: "santeplus-devis.pdf",
    incoterm: "DDP",
    commentaire: "",
    produits: [
      { nom: "Ibuprofène", quantite: 8000, prix: 30 },
    ],
    documents: {
      amm: "amm_santeplus.pdf",
      coa: "",
      planning: "livraison_santeplus.pdf",
    },
    livraison: {
      adresse: "Centre Médical Yoff",
      delai: "7 jours",
      mode: "Terrestre",
      dateExpedition: "2025-08-05",
    },
  },
];
const DetailSoumission = () => {
  const { id } = useParams<{ id: string }>();
  const soumission = soumissions.find((s) => s.id === Number(id));

  if (!soumission) {
    return <div className="container mt-5">❌ Soumission introuvable.</div>;
  }

  return (
    <>
    <div className="container mt-5">
      <div className="bg-white p-4 rounded-3 shadow-sm border">
        <div className="d-flex justify-content-between align-items-center mb-4">
             <h3 className="text-primary ">Détails de la soumission</h3>
             <small className="">
                <strong>statut : </strong> <span className="text-danger">En attente</span>
             </small>
        </div>
        <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ width: "45%" }}>
               <h5>produits</h5>
               <div className="accordion " id="soumissionAccordion">
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

            <div className="bg-white p-4  rounded-4 shadow-sm border" style={{ width: "50%" }}>
                      <p><strong>Fournisseur :</strong> {soumission.fournisseur}</p>
                      <p><strong>Date de soumission :</strong> {new Date(soumission.dateSoumission).toLocaleDateString()}</p>
                      <p><strong>Incoterm :</strong> {soumission.incoterm}</p>
                      <p><strong>Commentaire :</strong> {soumission.commentaire || "Aucun commentaire"}</p> 
            </div>

        </div>
        <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ width: "45%" }}>
               <h5 className="mb-3">Détails de la livraison</h5>
               <div>
                    <p><strong>Adresse :</strong> {soumission.livraison.adresse}</p>
                    <p><strong>Délai :</strong> {soumission.livraison.delai}</p>
                    <p><strong>Mode de livraison :</strong> {soumission.livraison.mode}</p>
                    <p><strong>Date d'expédition :</strong> {new Date(soumission.livraison.dateExpedition).toLocaleDateString()}</p>
               </div>
            </div>

        </div>

         <div className="bg-white p-4 rounded-4 shadow-sm border mt-4 col-12" style={{ borderLeft: "4px solid #6f42c1" }}>
            <div className="d-flex align-items-center mb-4">
              <i className="bi bi-file-earmark-arrow-down text-purple me-2 fs-5"></i>
              <h5 className="mb-0 fw-semibold text-dark">Documents joints</h5>
            </div>
            
            <div className="row g-4 ">
              {Object.entries(soumission.documents).map(([key, value]) => (
                value ? (
                  <div key={key} className="col-md-6 shadow-sm col-lg-4">
                    <div className="card shadow-sm border-0 h-100 hover-shadow transition-all">
                      <div className="card-body d-flex align-items-center p-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="bi bi-file-earmark-pdf text-primary"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="card-title mb-1 text-uppercase fw-bold" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
                            {key}
                          </h6>
                          <p className="card-text text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                            {value}
                          </p>
                          <a href="#" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                            <i className="bi bi-download me-1"></i>
                            Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default DetailSoumission;