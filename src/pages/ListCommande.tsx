import { useNavigate } from 'react-router-dom';

const commandes = [
    {
        id: 1,
        client: "District Dakar",
        lignes: [
            { produit: "Paracétamol", quantite: 1000 },
            { produit: "Ibuprofène", quantite: 500 }
        ],
        typeLivraison: "72h"
    },
    {
        id: 2,
        client: "District Kaolack",
        lignes: [
            { produit: "Amoxicilline", quantite: 800 }
        ],
        typeLivraison: "24h"
    }
];

const ListCommande = () => {
    const navigate = useNavigate();

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">📦 Commandes Hors Programme</h2>

            <div className="row">
                {commandes.map((cmd) => (
                    <div key={cmd.id} className="col-md-6 col-lg-4">
                        <div
                            className="commande-card card mb-4 border-0 shadow-sm"
                            onClick={() => navigate(`/commande/${cmd.id}`)}
                        >
                            <div className="card-body d-flex flex-column justify-content-between h-100">
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="fw-bold mb-0 text-dark">{cmd.client}</h5>
                                        <span className="badge bg-info text-dark">
                                            <i className="bi bi-truck"></i> {cmd.typeLivraison}
                                        </span>
                                    </div>
                                    <p className="text-muted small mb-0">
                                        {cmd.lignes.length} article(s) commandé(s)
                                    </p>
                                </div>

                                <div className="text-end mt-3">
                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                        Voir détails <i className="bi bi-arrow-right-short"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListCommande;
