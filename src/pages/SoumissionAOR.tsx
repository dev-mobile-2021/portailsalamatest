import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  FaFileUpload,
  FaCheckCircle,
  FaPaperPlane,
  FaInfoCircle,
  FaFileContract,
  FaHandshake,
  FaCalculator,
  FaClipboardCheck
} from "react-icons/fa";

const fakeAORs = [
  {
    id: 5,
    titre: "AOR - Médicaments Essentiels",
    reference: "AOR.MED.2025",
    deadline: "30 Juillet 2025",
    ouvertureOffres: "31 Juillet 2025",
    type: "National",
    coefficient: 1.05,
    produits: [
      {
        id: 1,
        nom: "Paracétamol 500mg",
        fabricant: "Sanofi",
        quantite: 50000,
        conditionnement: "Boîte de 20 comprimés",
        targetPrice: 850,
        prequalifie: true,
        amm: "AMM-2024-001"
      },
      {
        id: 2,
        nom: "Amoxicilline 250mg",
        fabricant: "GSK",
        quantite: 20000,
        conditionnement: "Flacon 60ml",
        targetPrice: 1250,
        prequalifie: true,
        amm: "AMM-2023-045"
      }
    ]
  },
  {
    id: 6,
    titre: "AOR - Dispositifs Médicaux Stériles",
    reference: "AOR.DMS.2025",
    deadline: "28 Juillet 2025",
    ouvertureOffres: "29 Juillet 2025",
    type: "International",
    coefficient: 1.12,
    produits: [
      {
        id: 3,
        nom: "Seringues jetables 5ml",
        fabricant: "BD Medical",
        quantite: 100000,
        conditionnement: "Boîte de 100 unités",
        targetPrice: 2500,
        prequalifie: true,
        amm: "CE-2024-789"
      },
      {
        id: 4,
        nom: "Cathéters urinaires",
        fabricant: "Coloplast",
        quantite: 5000,
        conditionnement: "Unité stérile",
        targetPrice: 3800,
        prequalifie: true,
        amm: "CE-2023-456"
      }
    ]
  }
];

const SoumissionAOR = () => {
  const { id } = useParams();
  const aor = fakeAORs.find(a => a.id === Number(id));

  const [form, setForm] = useState<{
    termeCommercial: string;
    commentaireTerme: string;
    delaiLivraison: string;
    validiteOffre: string;
    produits: { [key: number]: any };
    documents: {
      facture: File | null;
      packingListe: FileList | null;
      coa: FileList | null;
      hawbOrBl: File | null;
      lta: FileList | null;
      declarationExport: File | null;
      permisExportation: File | null;
    };
  }>({
    termeCommercial: '',
    commentaireTerme: '',
    delaiLivraison: '',
    validiteOffre: '',
    produits: {},
    documents: {
      facture: null,
      packingListe: null,
      coa: null,
      hawbOrBl: null,
      lta: null,
      declarationExport: null,
      permisExportation: null
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);

  if (!aor) {
    return <div className="container mt-5 text-danger">AOR introuvable</div>;
  }

  const handleTermeChange = (terme: any) => {
    setForm(prev => {
      const nouveauxProduits = { ...prev.produits };
      aor.produits.forEach(produit => {
        if (nouveauxProduits[produit.id]) {
          nouveauxProduits[produit.id] = {
            ...nouveauxProduits[produit.id],
            termeCommercial: terme
          };
        } else {
          nouveauxProduits[produit.id] = {
            prixUnitaire: '',
            termeCommercial: terme,
            commentaire: ''
          };
        }
      });

      return {
        ...prev,
        termeCommercial: terme,
        commentaireTerme: (terme === 'DDP') ? '' : prev.commentaireTerme,
        produits: nouveauxProduits
      };
    });
  };

  const handleProduitChange = (produitId: any, field: any, value: any) => {
    setForm(prev => ({
      ...prev,
      produits: {
        ...prev.produits,
        [produitId]: {
          ...prev.produits[produitId],
          [field]: value
        }
      }
    }));
  };

  const handleProduitTermeChange = (produitId: any, terme: any) => {
    setForm(prev => ({
      ...prev,
      produits: {
        ...prev.produits,
        [produitId]: {
          ...prev.produits[produitId],
          termeCommercial: terme,
          // Réinitialiser le commentaire si on passe à DDP
          commentaire: (terme === 'DDP') ? '' : (prev.produits[produitId]?.commentaire || '')
        }
      }
    }));
  };

  const handleDocumentUpload = (docType: any, files: any) => {
    setForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: files
      }
    }));
  };

  const calculateTotal = () => {
    return Object.entries(form.produits).reduce((total, [produitId, data]) => {
      const produit = aor.produits.find(p => p.id === Number(produitId));
      if (produit && data.prixUnitaire) {
        const sousTotal = parseFloat(data.prixUnitaire) * produit.quantite;
        const termeProduit = data.termeCommercial || 'DDP';
        const coefficient = (termeProduit !== 'DDP') ? aor.coefficient : 1;
        return total + (sousTotal * coefficient);
      }
      return total;
    }, 0);
  };

  const validateForm = () => {
    const allPricesSet = aor.produits.every(p =>
      form.produits[p.id]?.prixUnitaire
    );

    return allPricesSet && form.termeCommercial && form.delaiLivraison && form.validiteOffre;
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    
    if (form.termeCommercial === 'Autre' && !form.commentaireTerme.trim()) {
      alert("Un commentaire est obligatoire pour le terme 'Autre'");
      return;
    }

    // Vérifier les commentaires pour chaque produit avec terme "Autre"
    for (const [produitId, data] of Object.entries(form.produits)) {
      if (data.termeCommercial === 'Autre' && !data.commentaire?.trim()) {
        const produit = aor.produits.find(p => p.id === Number(produitId));
        alert(`Un commentaire est obligatoire pour le terme commercial "Autre" du produit: ${produit?.nom}`);
        return;
      }
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="container mt-5">
      <div className="bg-white p-4 rounded-3 shadow-sm border">
        <div className="d-flex align-items-center mb-3">
          <h3 className="text-success mb-3">Formulaire de Soumission AOR</h3>
        </div>

        <hr className="mb-4" />
        <br />

        {showSuccess && (
          <div className="alert alert-success d-flex align-items-center mb-4">
            <FaCheckCircle className="me-2" />
            <div>
              <strong>Succès !</strong> Votre soumission AOR a été envoyée avec succès.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="alert alert-info">
            <FaInfoCircle className="me-2" />
            <strong>Important :</strong> Cette AOR est réservée aux couples produit/fabricant préqualifiés.
          </div>
          <br />

          <div className="mb-4">
            <h5 className="text-success mb-3">
              <FaHandshake className="me-2" />
              Termes commerciaux
            </h5>
            <div className="row">
              <div className="col-md-6">
                <div className={`card h-100 ${form.termeCommercial === 'DDP' ? 'border-success' : ''}`}>
                  <div className="card-body text-center">
                    <input
                      type="radio"
                      name="termeCommercial"
                      id="DDP"
                      className="form-check-input me-2"
                      checked={form.termeCommercial === 'DDP'}
                      onChange={() => handleTermeChange('DDP')}
                      required
                    />
                    <label htmlFor="DDP" className="form-check-label">
                      <h6 className="card-title text-success">DDP</h6>
                      <p className="card-text small">
                        Delivered Duty Paid - Livré droits acquittés
                      </p>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card h-100 ${form.termeCommercial === 'Autre' ? 'border-warning' : ''}`}>
                  <div className="card-body text-center">
                    <input
                      type="radio"
                      name="termeCommercial"
                      id="Autre"
                      className="form-check-input me-2"
                      checked={form.termeCommercial === 'Autre'}
                      onChange={() => handleTermeChange('Autre')}
                      required
                    />
                    <label htmlFor="Autre" className="form-check-label">
                      <h6 className="card-title text-warning">Autre</h6>
                      <p className="card-text small">
                        CIF, CIP ou autre terme commercial
                      </p>
                      <small className="text-danger">* Commentaire obligatoire</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {form.termeCommercial === 'Autre' && (
              <div className="mt-3">
                <label className="form-label">Précisez le terme commercial (CIF, CIP, etc.) <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Saisir incoterm..."
                  value={form.commentaireTerme}
                  onChange={(e) => setForm(prev => ({ ...prev, commentaireTerme: e.target.value }))}
                  required
                />
              </div>
            )}
          </div>

          {form.termeCommercial === 'Autre' && (
            <div className="alert alert-info d-flex align-items-center mb-4">
              <FaCalculator className="me-2" />
              <div>
                <strong>Coefficient appliqué :</strong> {aor.coefficient}
                <small className="d-block text-muted">
                  Votre offre sera multipliée par ce coefficient pour la comparaison
                </small>
              </div>
            </div>
          )}

          <br />

          {/* Section Offre Financière */}
          <h5 className="text-success mb-3">
            <FaClipboardCheck className="me-2" />
            Détails de votre offre
          </h5>

          <div className="table-responsive mt-4 mb-4">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Produit</th>
                  <th>Fabricant</th>
                  <th>Quantité</th>
                  <th>Conditionnement</th>
                  <th>Prix Unitaire (F CFA)</th>
                  <th>Termes commerciaux</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {aor.produits.map((produit) => {
                  const formData = form.produits[produit.id] || {};
                  const prixUnitaire = parseFloat(formData.prixUnitaire) || 0;
                  const total = prixUnitaire * produit.quantite;

                  return (
                    <tr key={produit.id}>
                      <td><strong>{produit.nom}</strong></td>
                      <td>{produit.fabricant}</td>
                      <td>{produit.quantite.toLocaleString()}</td>
                      <td>{produit.conditionnement}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Prix unitaire"
                          value={formData.prixUnitaire || ''}
                          onChange={(e) =>
                            handleProduitChange(produit.id, 'prixUnitaire', e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                formData.termeCommercial === 'DDP' || !formData.termeCommercial
                                  ? 'btn-success'
                                  : 'btn-outline-secondary'
                              }`}
                              onClick={() => handleProduitTermeChange(produit.id, 'DDP')}
                            >
                              DDP
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                formData.termeCommercial === 'Autre'
                                  ? 'btn-warning'
                                  : 'btn-outline-secondary'
                              }`}
                              onClick={() => handleProduitTermeChange(produit.id, 'Autre')}
                            >
                              Autre
                            </button>
                          </div>
                          {formData.termeCommercial === 'Autre' && (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Saisir incoterm"
                              value={formData.commentaire || ''}
                              onChange={(e) => handleProduitChange(produit.id, 'commentaire', e.target.value)}
                              required
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{total.toLocaleString()} F CFA</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={6}>Total Général</th>
                  <th>{calculateTotal().toLocaleString()} F CFA</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mb-4">
            <h5 className="text-success mb-3">
              <FaFileContract className="me-2" />
              Conditions générales
            </h5>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Délai de livraison <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={form.delaiLivraison}
                  onChange={(e) => setForm(prev => ({ ...prev, delaiLivraison: e.target.value }))}
                  placeholder="Ex: 30 jours"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Validité de l'offre <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={form.validiteOffre}
                  onChange={(e) => setForm(prev => ({ ...prev, validiteOffre: e.target.value }))}
                  placeholder="Ex: 90 jours"
                  required
                />
              </div>
            </div>
          </div>

          {aor.type === "International" && (
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <FaFileUpload className="me-2" />
                  Documents Requis (Fournisseurs étrangers)
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong className="text-danger">*</strong> Facture
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleDocumentUpload('facture', e.target.files?.[0] || null)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong className="text-danger">*</strong> Packing liste
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={(e) => handleDocumentUpload('packingListe', e.target.files)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">COA</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={(e) => handleDocumentUpload('coa', e.target.files)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">HAWB ou BL</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleDocumentUpload('hawbOrBl', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">LTA</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={(e) => handleDocumentUpload('lta', e.target.files)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Déclaration à l'export</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleDocumentUpload('declarationExport', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Permis d'exportation</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleDocumentUpload('permisExportation', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <br />

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
              </small>
            </div>
            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={!validateForm()}
            >
              <FaPaperPlane className="me-2" />
              Soumettre l'offre AOR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoumissionAOR;