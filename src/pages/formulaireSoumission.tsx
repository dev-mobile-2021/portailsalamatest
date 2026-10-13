import { useParams } from "react-router-dom";
import { useState } from "react";


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
    }
];


const FormulaireSoumission = () => {
    const { id } = useParams<{ id: string }>();
    const tender = fakeTenders.find(t => t.id === Number(id));

    const [form, setForm] = useState<{
        prix: Record<string, number>;
        fichier?: File | null;
    }>({
        prix: {},
        fichier: null
    });

    const handlePrixChange = (produit: string, value: string) => {
        setForm(prev => ({
            ...prev,
            prix: {
                ...prev.prix,
                [produit]: parseFloat(value)
            }
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setForm(prev => ({ ...prev, fichier: file || null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("✅ Devis soumis !");
        console.log("Formulaire soumis :", form);
    };

    return (
        <>

            <div className="container mt-5">
                <div className="bg-white p-4 rounded-3 shadow-sm border">

                    <form onSubmit={handleSubmit}>
                        <h5 className="text-secondary mt-4">📦 Formulaire soumission</h5>
                        <table className="table table-bordered table-sm mt-2">
                            <thead className="table-light">
                                <tr>
                                    <th>Produit</th>
                                    <th>Quantité demandée</th>
                                    <th>Quantité isponible</th>
                                    <th>Prix unitaire (Ar)</th>
                                    <th>Commentaire</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tender && tender.produits.map((p, index) => (
                                    <tr key={index}>
                                        <td>{p.nom}</td>
                                        <td>{p.quantite.toLocaleString()}</td>
                                        <td><input type="text" defaultChecked className="form-control form-control-sm" /></td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                placeholder="0"
                                                onChange={(e) => handlePrixChange(p.nom, e.target.value)}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <input type="text"
                                                className="form-control form-control-sm" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mb-3">
                            <label className="form-label">📄 Joindre votre devis (PDF)</label>
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary rounded-pill px-4 pos">
                            📤 Soumettre le devis
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}


export default FormulaireSoumission;