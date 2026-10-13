import { useParams } from "react-router-dom";

const fakeTenders = [
  {
    id: 5,
    titre: "Achat Médicaments Essentiels",
    reference: "YHJ.2025",
    deadline: "1 Juillet 2025",
    publishedDate: "20 juin 2025",
    description: "Fourniture de médicaments, consommables et équipements médicaux...",
    produits: [
      { nom: "Paracétamol", quantite: 10000 },
      { nom: "Amoxicilline", quantite: 5000 },
    ],
    documents: [
      { label: "Contrat cadre", url: "/docs/contrat-cadre.pdf" },
      { label: "Cahier des charges", url: "/docs/cahier-charges.pdf" },
    ],
    devis: [
      { id: 101, date: "25 juin 2025", status: "en attente" },
      { id: 102, date: "27 juin 2025", status: "validé" },
    ],
  },
];

const TenderDetailsAchatDirect = () => {
  const { id } = useParams<{ id: string }>();
  const tender = fakeTenders.find((t) => t.id === Number(id));

  if (!tender) {
    return <div className="container mt-5">❌ Appel d'offres introuvable.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="bg-white p-4 rounded-3 shadow-sm border">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary">📄 Détails de l’appel d’offres</h3>
          <small>
            <strong>Référence :</strong> <span className="text-muted">{tender.reference}</span>
          </small>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <p><strong>Titre :</strong> {tender.titre}</p>
            <p><strong>Date de publication :</strong> {tender.publishedDate}</p>
            <p><strong>Deadline :</strong> {tender.deadline}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Description :</strong></p>
            <p className="text-muted">{tender.description}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
          <h5 className="mb-3">📦 Produits demandés</h5>
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité demandée</th>
              </tr>
            </thead>
            <tbody>
              {tender.produits.map((prod, idx) => (
                <tr key={idx}>
                  <td>{prod.nom}</td>
                  <td>{prod.quantite.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
          <h5 className="mb-3">📑 Documents sollicités</h5>
          <div className="row g-4">
            {tender.documents.map((doc, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body d-flex align-items-center p-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                      <i className="bi bi-file-earmark-pdf text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1 text-uppercase fw-bold" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
                        {doc.label}
                      </h6>
                      <p className="card-text text-muted mb-2">{doc.url.split("/").pop()}</p>
                      <a href={doc.url} className="btn btn-outline-primary btn-sm rounded-pill px-3" download>
                        <i className="bi bi-download me-1"></i>
                        Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-between rounded-4 bg-white mb-4 border-0 shadow-sm pt-3">
            <div className="bg-white p-4 rounded-4 shadow-sm " style={{ width: "48%" }}>
                 <div className="">
                    <strong>Adresse de livraison :</strong>
                    <p className="text-muted mb-0">À préciser dans la soumission</p>
                    </div>
                    <div className="">
                    <strong>Délai estimé de livraison :</strong>
                    <p className="text-muted mb-0">À indiquer par le soumissionnaire</p>
                    </div>
                    <div className="">
                    <strong>Mode de livraison :</strong>
                    <p className="text-muted mb-0">Exemple : terrestre, maritime, aérien</p>
                    </div>
                    <div className="">
                    <strong>Date prévue pour l'expédition :</strong>
                    <p className="text-muted mb-0">À renseigner</p>
                    </div>  
            </div>
            <div className="d-flex flex-column bg-white p-4 align-item-end rounded-4 shadow-sm " style={{ width: "48%" }}>
                    <div className="">
                    <strong>Ordre de transit :</strong>
                    <p className="text-muted mb-0">Requis si applicable</p>
                    </div>
                    <div className="">
                    <strong>Incoterm souhaité :</strong>
                    <p className="text-muted mb-0">CIF ou CIP</p>
                    </div>
                    <div className="">
                    <strong>Numéro MIDAC :</strong>
                    <p className="text-muted mb-0">Si disponible</p>
                    </div>
            </div>
        </div>
        <div className="bg-white p-4 rounded-4 shadow-sm border">
          <h5 className="mb-3">📊 Historique des devis reçus</h5>
          <table className="table table-bordered table-sm">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Date de soumission</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {tender.devis.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.date}</td>
                  <td>
                    <span className={`badge ${d.status === 'validé' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default TenderDetailsAchatDirect;
