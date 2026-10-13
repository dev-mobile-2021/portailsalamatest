import { useParams } from "react-router-dom";
import { useState } from "react";


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


const FormulaireSoumissionConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const tender = fakeTenders.find((t) => t.id === Number(id));

  const [form, setForm] = useState<{
    prix: Record<string, number>;
    fichier?: File | null;
    incoterm: string;
    commentaire?: string;
    autresFichiers: {
      amm?: File | null;
      coa?: File | null;
      planning?: File | null;
    };
  }>({
    prix: {},
    fichier: null,
    incoterm: "DDP",
    commentaire: "",
    autresFichiers: {},
  });

  const handlePrixChange = (produit: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      prix: {
        ...prev.prix,
        [produit]: parseFloat(value),
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, fichier: file || null }));
  };

  const handleOtherFileChange = (type: keyof typeof form.autresFichiers, file?: File) => {
    setForm((prev) => ({
      ...prev,
      autresFichiers: {
        ...prev.autresFichiers,
        [type]: file ?? null,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(" Devis soumis !");
    console.log("Formulaire soumis :", form);
  };

  return (
    <div className="container mt-5">
      <div className="bg-white p-4 rounded-3 shadow-sm border">
        <form onSubmit={handleSubmit}>
          <h5 className="text-secondary text-center mt-4 mb-5"> Formulaire de soumission</h5>

          <table className="table table-bordered table-sm mt-2">
            <thead className="table-light">
              <tr>
                <th>Produit</th>
                <th>Quantité demandée</th>
                <th>Quantité disponible</th>
                <th>Prix unitaire (Ar)</th>
                <th>Incoterm</th>
                
                  {form.incoterm !== "DDP" && (
                    <th>
                    <div className="mb-3">
                       commentaire
                    </div>
                    
                </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {tender?.produits.map((p, index) => (
                <tr key={index}>
                  <td>{p.nom}</td>
                  <td>{p.quantite.toLocaleString()}</td>
                  <td><input type="text" className="form-control form-control-sm" /></td>
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
                    <select
                      className="form-select form-select-sm"
                      value={form.incoterm}
                      onChange={(e) => setForm({ ...form, incoterm: e.target.value })}
                      required
                    >
                      <option value="DDP">DDP</option>
                      <option value="CIF">CIF</option>
                      <option value="CIP">CIP</option>
                    </select>
                  </td>
              
                  {form.incoterm !== "DDP" && (
                     <td>
                    <div className="mb-3">
                     
                        <input type="text" className="form-control form-control-sm"
                        required
                        onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />
                      
                    </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <label className="form-label">📄 Joindre votre devis (PDF)</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

            <h5 className="text-secondary"> Documents supplémentaires</h5>
          <div className="mb-4 col-12 d-flex gap-2 mt-4">
            <div className="col-4">
                <label className="form-label"> Certificat AMM</label>
                <input
                type="file"
                className="form-control mb-2"
                accept=".pdf"
                onChange={(e) => handleOtherFileChange("amm", e.target.files?.[0])}
                />
            </div>
            <div className="col-4">
                    <label className="form-label"> Certificat d’analyse</label>
                    <input
                    type="file"
                    className="form-control mb-2"
                    accept=".pdf"
                    onChange={(e) => handleOtherFileChange("coa", e.target.files?.[0])}
                    />
            </div>
            <div className="col-4">
            <label className="form-label"> Planning de livraison</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf"
              onChange={(e) => handleOtherFileChange("planning", e.target.files?.[0])}
            />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label"> Adresse de livraison</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="col-md-4">
              <label className="form-label"> Délai estimé</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="col-md-4">
              <label className="form-label"> Mode de livraison</label>
              <input type="text" className="form-control" required />
            </div>
          </div>

           <div className="col-3 mb-3">
                         <label htmlFor="" className="form-label ">Date prévu pour l'expedition</label>
                         <input type="date" className="form-control " name="" id="" />
                     </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary rounded-pill px-4">
               Soumettre le devis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




export default FormulaireSoumissionConsultation;