import { useParams } from "react-router-dom";
import { useState } from "react";


const fakeTenders = [
    {
        id: 4,
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


const FormulaireSoumissionInter = () =>{
    const { id } = useParams<{ id: string }>();
const tender = fakeTenders.find(t => t.id === Number(id));

     const [form, setForm] = useState<{
  prix: Record<string, number>;
  fichier?: File | null;
    documentsSollicites?: File[]; 
    }>({
    prix: {},
    fichier: null,
    documentsSollicites: [],
    });
    const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        setForm(prev => ({
        ...prev,
        documentsSollicites: Array.from(files)
        }));
    }
    };
  
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

    return(
        <>
        
        <div className="container mt-5">
            <div className="bg-white p-4 rounded-3 shadow-sm border">

             <form onSubmit={handleSubmit}>
                    <h5 className="text-secondary text-center mt-4 mb-5">📦 Formulaire soumission</h5>
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
                            {tender?.produits?.map((p, index) => (
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
                        <label htmlFor="documents" className="form-label">Charger des documents sollicités</label>
                            
                        <input
                        type="file"
                        className="form-control"
                        accept=".pdf"
                        multiple
                        required
                        onChange={handleDocumentsChange}
                    />
                          
                    </div>
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
                    <div className="col-12 d-flex gap-3 mb-3">
                        <div className="col-4">
                            <label htmlFor="">Ordre de transit</label>
                            <input type="text" className="form-control" />
                        </div>
                        <div className="col-4">
                            <label htmlFor="">Sélection du transitaire (si CIF/CIP)</label>
                            <select className="form-select">
                                <option value="">CIF</option>
                                <option value="CIP">CIP</option>
                            </select>
                        </div>

                    </div>
                    <div className="col-3 mb-3">
                        <label className="form-label">N° MIDAC (si disponible)</label>
                        <input type="text" className="form-control" />
                    </div>

                    <div>
                        <h5 className="text-secondary mt-4">Détails de Livraison</h5>
                        <div className="col-12 d-flex gap-3 mb-3">
                            <div className="col-3">
                                <label htmlFor="" className="form-label ">Adresse de livraison</label>
                                <input type="text" className="form-control " name="" id="" />
                            </div>
                            <div className="col-3">
                                <label htmlFor="" className="form-label col-6">Délai estimé</label>
                                <input type="text" className="form-control col-6" name="" id="" />
                            </div>
                            <div className="col-3">
                                <label htmlFor="" className="form-label col-6">Mode de livraison</label>
                                <input type="text" className="form-control col-6" name="" id="" />
                            </div>
                        </div>
                    </div>
                     <div className="col-3 mb-3">
                         <label htmlFor="" className="form-label ">Date prévu pour l'expedition</label>
                         <input type="date" className="form-control " name="" id="" />
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


export default FormulaireSoumissionInter;