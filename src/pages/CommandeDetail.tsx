import { useParams, Link } from 'react-router-dom';

const commandes = [
    {
        id: 1,
        client: "District Dakar",
        date: "2024-07-01",
        dateReception: "2024-07-05",
        lignes: [
            { produit: "Paracétamol", quantite: 1000, consommationMoyenne: "200/mois" },
            { produit: "Ibuprofène", quantite: 500, consommationMoyenne: "150/mois" },
        ],
        statut: "Livraison",
        typeLivraison: "72h",
        etat: 2
    },
    {
        id: 2,
        client: "District Kaolack",
        date: "2024-06-20",
        dateReception: "2024-06-24",
        lignes: [
            { produit: "Amoxicilline", quantite: 800, consommationMoyenne: "300/mois" }
        ],
        statut: "Facturation",
        typeLivraison: "24h",
        etat: 3
    }
];

const etapes = ["Bon de commande", "Préparation", "Livraison", "Facturation"];

const CommandeDetail = () => {
    const { id } = useParams();
    const commande = commandes.find(c => c.id === parseInt(id ?? ''));

    if (!commande) return <div className="container mt-5">Commande introuvable</div>;

    return (
        <div className="container mt-5">
            <Link to="/" className="btn btn-outline-secondary mb-3">&larr; Retour à la liste</Link>

            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between">
                    <h5>{commande.client}</h5>
                    <span className="badge bg-light text-primary">{commande.typeLivraison}</span>
                </div>

                <div className="card-body">
                    <p><strong>Date commande :</strong> {commande.date}</p>
                    <p><strong>Réception prévue :</strong> {commande.dateReception}</p>

                    <div className="table-responsive mt-3">
                        <table className="table table-striped table-bordered align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Produit</th>
                                    <th>Quantité</th>
                                    <th>Consommation Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commande.lignes.map((ligne, index) => (
                                    <tr key={index}>
                                        <td>{ligne.produit}</td>
                                        <td>{ligne.quantite}</td>
                                        <td>{ligne.consommationMoyenne}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="progress-step-wrapper mt-4">
                        {etapes.map((etape, index) => (
                            <div key={index} className={`step ${commande.etat >= index ? 'active' : ''}`}>
                                <div className="circle">{index + 1}</div>
                                <div className="label">{etape}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandeDetail;
