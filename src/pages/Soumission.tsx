
import { useParams } from "react-router-dom";

const soumissions = [
    {
        id: 101,
        tenderId: 1,
        fournisseur: {
            nom: "PharmaPlus",
            email: "contact@pharmaplus.sn"
        },
        dateSoumission: "27 juin 2025",
        status: "en attente", 
        produits: [
            { nom: "Paracétamol", quantite: 10000, prix: 50 },
            { nom: "Amoxicilline", quantite: 5000, prix: 120 }
        ],
        remarques: "Livraison possible en 10 jours"
    }
];

const Soumission = () => {
    const { id } = useParams<{ id: string }>();
    const soum = soumissions.find(s => s.id === Number(id));

    if (!soum) return <div className="container mt-5 text-danger">Soumission introuvable</div>;

    return (
        <div className="container mt-5">
            <div className="bg-white p-4 rounded shadow-sm border">
                <h4 className="text-primary mb-3">🧾 Détail de la soumission #{soum.id}</h4>

                <div className="mb-3">
                    <strong>Fournisseur :</strong> {soum.fournisseur.nom} <br />
                    <strong>Email :</strong> {soum.fournisseur.email} <br />
                    <strong>Date de soumission :</strong> {soum.dateSoumission} <br />
                    <strong>Statut :</strong> {soum.status}
                </div>

                <h5 className="text-secondary mt-4">📦 Produits proposés</h5>
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                        <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire (Ar)</th>
                            <th>Action / Discussion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {soum.produits.map((prod, index) => (
                            <tr key={index}>
                                <td>{prod.nom}</td>
                                <td>{prod.quantite.toLocaleString()}</td>
                                <td>{prod.prix.toLocaleString()}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Suggérer un prix ou commentaire"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-3">
                    <strong>Remarques du fournisseur :</strong>
                    <div className="border p-2 rounded bg-light mt-1">{soum.remarques}</div>
                </div>

                <div className="mt-4">
                    <label className="form-label">📝 Remarques ou discussions globales :</label>
                    <textarea className="form-control" rows={3} placeholder="Ex: Merci de revoir les prix unitaires..."></textarea>
                </div>

                <div className="mt-3">
                    <button className="btn btn-success rounded-pill px-4 me-2">✅ Valider la soumission</button>
                    {/* <button className="btn btn-danger rounded-pill px-4">❌ Rejeter</button> */}
                </div>
            </div>
        </div>
    );
};

export default Soumission;
