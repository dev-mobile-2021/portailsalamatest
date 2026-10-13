import { useState, useEffect } from "react";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useUserhook";
import { useArticles } from "../../hooks/useArticles";
import useTarifSage from "../../hooks/useTarifSage";
import useClients from "../../hooks/useClients";
import SmallHeader from "../../components/const/SmallHeader";
import InfoDisplay from "../../components/InfoDisplay";
import SelectDisplay from "../../components/SelectDisplay";
import { useNotification } from "../../hooks/useNotification";
import { useSousFamilles } from "../../hooks/useSousFamilles";
import { createItem } from "../../api/crudService"; // Import du service pour créer une commande
import back_icon from "../../assets/images/back.png";
import ClientSelect from "../../components/ClientSelect";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";
import CommentInput from "../../components/ui/CommentInput";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PriceFetchingModal from "../../components/ui/PriceFetchingModal";
import OrderAddingModal from "../../components/ui/OrderAddingModal";

const CommandeRC = () => {
  const { sousFamilles, loading, error } = useSousFamilles();

  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {} = useNotification();
  const { fetchTarif } = useTarifSage();
  const { clients } = useClients(user?.id || null);

  // État pour le modal de confirmation de changement de client
  const [showClientChangeModal, setShowClientChangeModal] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<number | null>(null);

  // État pour le loader de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour le modal d'ajout de commande
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [orderError, setOrderError] = useState("");

  // État pour le modal de récupération de prix
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [currentArticleName, setCurrentArticleName] = useState("");

  interface DetailCommande {
    article_id: number | null;
    articleHorsCatalogue: string;
    famille: string;
    quantite: number;
    consoMoyenne: number;
    prixvente: number;
    type: "Catalogue" | "Hors catalogue";
  }

  const [commande, setCommande] = useState<{
    client: string;
    client_id: number | null;
    lignecommandes: DetailCommande[];
    commentaire: string;
  }>({
    client: "Client connecté",
    client_id: null,
    lignecommandes: [],
    commentaire: "",
  });

  // Utilisation du hook useArticles pour récupérer les articles avec TCLCOD_0: 1 et client_id
  const { articles: produitsSimules, error: errorArticles } = useArticles({
    TCLCOD_0: 1,
  });

  // Affichage d'une erreur si la récupération des articles échoue
  useEffect(() => {
    if (errorArticles) {
      toast.error(
        `Erreur lors de la récupération des articles: ${errorArticles}`,
      );
    }
  }, [errorArticles]);

  useEffect(() => {
    if (!user?.client_id) return;
    setCommande((prev) =>
      prev.client_id === null ? { ...prev, client_id: user.client_id } : prev,
    );
  }, [user]);

  const [currentProduct, setCurrentProduct] = useState<any>({
    article_id: null,
    articleHorsCatalogue: "",
    famille: "",
    quantite: 0,
    consoMoyenne: 0,
    prixvente: 0,
    type: "Catalogue",
  });

  const [currentMultiple, setCurrentMultiple] = useState(1);
  const [autorise, setAutorise] = useState(true);

  // Plafond et Encours
  const encours = 570000000;

  const handleProductSelect = async (id: number) => {
    const produit = produitsSimules.find((p) => p.id === id);
    if (!produit) return;

    // Afficher le modal et commencer le chargement
    setCurrentArticleName(produit.designation);
    setShowPriceModal(true);
    setIsFetchingPrice(true);
    setFetchedPrice(null);

    let prix = 0;
    try {
      const selectedClient = clients.find((c) => c.id === commande.client_id);
      const codeCategorie = selectedClient?.codecategorie || "";
      const tarifData = await fetchTarif(produit.code || "", codeCategorie);
      const prixAPI = tarifData?.prix;
      prix = prixAPI ?? produit.pvht ?? 0;

      // Mettre à jour l'état du modal
      setFetchedPrice(prix);
      setIsFetchingPrice(false);

      if (prix > 0) {
        setTimeout(() => {
          setShowPriceModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Erreur récupération tarif:", err);
      // Afficher l'erreur dans le modal
      setFetchedPrice(0);
      setIsFetchingPrice(false);
      prix = produit.pvht || 0;
    }

    setCurrentProduct({
      article_id: id,
      articleHorsCatalogue: "",
      famille: produit.categorie,
      quantite: 0,
      consoMoyenne: 0,
      prixvente: prix,
      type: "Catalogue",
    });
    setCurrentMultiple(produit.multiple || 1);
    setAutorise(true);
  };

  const handleAddProduct = () => {
    if (
      currentProduct.type === "Catalogue" &&
      currentProduct.quantite % currentMultiple !== 0
    ) {
      toast.error(`La quantité doit être un multiple de ${currentMultiple}`);
      return;
    }
    if (
      (currentProduct.type === "Catalogue" && !currentProduct.article_id) ||
      (currentProduct.type === "Hors catalogue" &&
        !currentProduct.articleHorsCatalogue) ||
      currentProduct.quantite <= 0
    ) {
      toast.error("Veuillez saisir un produit et une quantité valide");
      return;
    }

    const index = commande.lignecommandes.findIndex(
      (item: any) =>
        (currentProduct.type === "Catalogue" &&
          item.article_id === currentProduct.article_id) ||
        (currentProduct.type === "Hors catalogue" &&
          item.articleHorsCatalogue === currentProduct.articleHorsCatalogue),
    );

    let updatedCommandes = [...commande.lignecommandes];
    if (index >= 0) {
      updatedCommandes[index] = currentProduct;
      toast.success("Produit mis à jour !");
    } else {
      updatedCommandes.push(currentProduct);
      toast.success("Produit ajouté !");
    }

    setCommande({ ...commande, lignecommandes: updatedCommandes });
    setCurrentProduct({
      article_id: null,
      articleHorsCatalogue: "",
      famille: "",
      quantite: 0,
      consoMoyenne: 0,
      prixvente: 0,
      type: currentProduct.type,
    });
  };

  const removeProduct = (idx: number) => {
    const updated = [...commande.lignecommandes];
    updated.splice(idx, 1);
    setCommande({ ...commande, lignecommandes: updated });
    toast.success("Produit supprimé !");
  };

  const handleQuantiteChange = (value: number) => {
    setCurrentProduct({ ...currentProduct, quantite: value });
    if (currentProduct.type === "Catalogue") {
      setAutorise(value % currentMultiple === 0);
    }
  };

  const totalCommandeHT = commande.lignecommandes.reduce(
    (acc: number, item: any) => acc + item.quantite * item.prixvente,
    0,
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const articlesComplets = commande.lignecommandes.filter(
      (a) => a.quantite > 0,
    );

    // Si client_id n'est pas choisi, utiliser celui du user (sauf si admin doit choisir explicitement)
    let clientIdToUse = commande.client_id;
    if (!clientIdToUse && user?.client_id) {
      clientIdToUse = user.client_id;
    }

    if (!clientIdToUse) {
      toast.error(
        "Veuillez sélectionner un client avant de valider la commande",
      );
      return;
    }

    if (articlesComplets.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à votre commande");
      return;
    }

    // setIsSubmitting(true);
    // Afficher le modal de chargement
    setShowOrderModal(true);
    setOrderStatus("loading");
    setOrderError("");

    try {
      const payload = {
        client_id: clientIdToUse,
        user_id: user?.id,
        typecommande_id: 6, // Type de commande spécifique pour RC
        commentaire: commande.commentaire || undefined,
        detailcommandes: articlesComplets.map((detail) => ({
          article_id:
            detail.type === "Hors catalogue" ? null : detail.article_id,
          quantite: detail.quantite,
          cmm: detail.consoMoyenne, // Consommation moyenne par mois
          catalogue: detail.type === "Catalogue" ? 1 : 0,
          pv_ht: detail.prixvente || 0,
          famille_id:
            detail.type === "Hors catalogue" ? detail.famille : undefined,
          article_text:
            detail.type === "Hors catalogue"
              ? detail.articleHorsCatalogue
              : undefined,
        })),
      };

      console.log("Payload préparé pour l'envoi :", payload);

      const response = await createItem("commande", payload);

      console.log("Réponse de l'API :", response);

      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "Erreur HTTP lors de l'envoi de la commande :",
          response.status,
          response.statusText,
        );
        throw new Error(
          `Erreur lors de l'envoi de la commande : ${response.statusText}`,
        );
      }

      console.log("Commande envoyée avec succès !");
      setOrderStatus("success");
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement ou de l'envoi de la commande :",
        error,
      );
      const details = extractApiErrorMessage(error);
      setOrderStatus("error");
      setOrderError(
        "Une erreur s'est produite lors de l'enregistrement ou de l'envoi de la commande." +
          (details ? ` Détails : ${details}` : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement des sous-familles...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Replace the static sousFamillesSimulees with the fetched sousFamilles
  const sousFamillesOptions = sousFamilles.map((f) => ({
    value: f.id, // Assuming SousFamille has an id field
    label: f.designation, // Corrected to match SousFamille type
  }));

  return (
    <div className="container py-4" style={{ maxWidth: "80vw" }}>
      <div className="greenSadow ">
        <SmallHeader />
      </div>

      <div
        className="mb-4 align-items-center"
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          marginTop: "-110px",
        }}
      >
        <div className="d-flex justify-content-center text-white mb-3">
          <div className="bg-white w-40 rounded-2 shadow-sm">
            <h4
              className="m-0 p-2 text-theme text-center m-2"
              style={{ fontWeight: "600", fontSize: "18px" }}
            >
              Expression des besoins → Commande RC Privé
            </h4>
          </div>
        </div>
      </div>
      <div
        style={{ marginBottom: "50px", fontSize: "1rem", fontWeight: "600" }}
      ></div>
      <div
        className="mb-4 mt-4 p-1 greenSadow"
        style={{ backgroundColor: "white", borderRadius: "8px" }}
      >
        <button
          className="btn bg-theme my-2 rounded-2 border-none px-2 py-2 mb-4"
          onClick={() => {
            navigate(`/listeType`);
          }}
        >
          <img src={back_icon} className="icon-size w-75" alt="" />
        </button>
        <div className="d-flex justify-content-between mb-4 gap-3">
          <div>
            {!user?.client_id ? (
              <ClientSelect
                value={commande.client_id}
                user_id={user?.id || 0}
                placeholder="Choisissez un client pour récupérer les articles"
                onChange={(clientId) => {
                  // Vérifier si des produits sont déjà dans la commande
                  if (
                    commande.lignecommandes.length > 0 &&
                    clientId !== commande.client_id
                  ) {
                    setPendingClientId(clientId);
                    setShowClientChangeModal(true);
                  } else {
                    setCommande((prev) => ({ ...prev, client_id: clientId }));
                  }
                }}
                onLoadError={(message) =>
                  toast.error(
                    `Erreur lors de la récupération des clients: ${message}`,
                  )
                }
              />
            ) : (
              <InfoDisplay
                label="Client"
                value={user?.name || "Non connecté"}
                isEnabled={false}
                inputStyle={{ backgroundColor: "#F6F6F6" }}
                labelStyle={{ color: "#CBCBCB" }}
                width={"100%"}
              />
            )}
          </div>
          <InfoDisplay
            label="En cours"
            value={encours.toLocaleString()}
            isEnabled={false}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />

          <div className="d-flex align-items-center mt-4">
            <div className="form-check form-check-inline checkbox">
              <input
                id="catalogueCheckbox"
                className="form-check-input "
                type="checkbox"
                style={{ transform: "scale(1.5)" }}
                checked={currentProduct.type === "Catalogue"}
                onChange={() =>
                  setCurrentProduct({
                    ...currentProduct,
                    type: "Catalogue",
                    articleHorsCatalogue: "",
                    famille: "",
                  })
                }
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "10px" }}
                htmlFor="catalogueCheckbox"
              >
                En catalogue
              </label>
            </div>
            <div className="form-check form-check-inline checkbox">
              <input
                id="horsCatalogueCheckbox"
                className="form-check-input"
                type="checkbox"
                style={{ transform: "scale(1.5)" }}
                checked={currentProduct.type === "Hors catalogue"}
                onChange={() =>
                  setCurrentProduct({
                    ...currentProduct,
                    type: "Hors catalogue",
                    article_id: null,
                    famille: "",
                  })
                }
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "10px" }}
                htmlFor="horsCatalogueCheckbox"
              >
                Hors catalogue
              </label>
            </div>
          </div>
        </div>
      </div>

      {currentProduct.type === "Catalogue" ? (
        <div className="row mb-3">
          <div className="col-md-12">
            <Select
              placeholder="Sélectionner un article..."
              options={produitsSimules.map((p) => ({
                value: p.id,
                label: p.designation,
              }))}
              value={
                produitsSimules
                  .map((p) => ({ value: p.id, label: p.designation }))
                  .find((opt) => opt.value === currentProduct.article_id) ||
                null
              }
              onChange={(selected) => {
                const article = produitsSimules.find(
                  (p) => p.id === selected?.value,
                );
                if (article) {
                  handleProductSelect(article.id);
                }
              }}
              isClearable
              isSearchable
            />
          </div>
        </div>
      ) : (
        <div className="row mb-3">
          <div className="col-md-6">
            <InfoDisplay
              type="text"
              label="Nom produit hors catalogue"
              value={currentProduct.articleHorsCatalogue}
              width={"100%"}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  articleHorsCatalogue: e.target.value,
                })
              }
              inputStyle={{ backgroundColor: "#1FB05B26" }}
              labelStyle={{ fontWeight: "bold" }}
              isEnabled={true}
              placeholder="Tapez un produit..."
            />
          </div>
          <div className="col-md-6">
            <SelectDisplay
              label="Sous-famille de médicaments"
              optionname="une sous-famille"
              onChange={(value) =>
                setCurrentProduct({
                  ...currentProduct,
                  famille: value,
                })
              }
              selectedValue={currentProduct.famille || ""}
              options={sousFamillesOptions}
            />
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-4">
          <InfoDisplay
            label="Qté"
            type="number"
            value={currentProduct.quantite}
            onChange={(value) =>
              handleQuantiteChange(Number(value.target.value))
            }
            width={"100%"}
            isEnabled={true}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />
          {!autorise && currentProduct.type === "Catalogue" && (
            <small className="text-danger">
              La quantité doit être un multiple de {currentMultiple}
            </small>
          )}
        </div>
        <div className="col-md-4">
          <InfoDisplay
            label="Conso moyenne / mois"
            value={currentProduct.consoMoyenne}
            type="number"
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
            width={"100%"}
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                consoMoyenne: Number(e.target.value),
              })
            }
            isEnabled={true}
          />
        </div>
        <div className="col-md-4">
          <InfoDisplay
            label="Prix"
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
            width={"100%"}
            value={currentProduct.prixvente}
            isEnabled={false}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-success p-3 mb-4" onClick={handleAddProduct}>
          <FaPlusCircle className="me-2 " /> Ajouter un produit
        </button>
      </div>

      {commande.lignecommandes.length > 0 && (
        <div className=" card w-full p-4 mb-5" style={{ borderRadius: "8px" }}>
          <div className="overflow-x-auto rounded-lg">
            {/* 1. Ajouter borderCollapse et borderSpacing sur la table */}
            <table
              className="w-full bg-white"
              style={{
                width: "100%",
                border: "none",
                borderCollapse: "separate", // ← AJOUT CRITIQUE
                borderSpacing: "0 12px", // ← DÉPLACER ICI depuis tbody
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1FB05B", color: "white" }}>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      width: "8.5%",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Produit
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Sous famille
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Qté
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Conso Moyenne
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Prix
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Total HT
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      width: "12.5%",
                      position: "sticky",
                      right: 0,
                      backgroundColor: "#1FB05B",
                      zIndex: 10,
                      boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* 2. Retirer borderSpacing et les <div> du tbody */}
              <tbody>
                {commande.lignecommandes.map((item, idx) => {
                  const pvHT = item.prixvente;
                  const totalHT = item.quantite * pvHT;
                  return (
                    // 3. SUPPRIMER les <> et <div> - garder seulement le <tr>
                    <tr
                      key={item.article_id || item.articleHorsCatalogue || idx}
                      style={{
                        height: "60px",
                        border: "1px solid #E5E7EB", // ← Changer la couleur ici (gris clair)
                        backgroundColor: "white",
                      }}
                    >
                      {/* Première cellule - bordure gauche uniquement */}
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTopLeftRadius: "8px",
                          borderBottomLeftRadius: "8px",
                          borderLeft: "inherit", // ← Hérite seulement à gauche
                          borderTop: "inherit", // ← Hérite en haut
                          borderBottom: "inherit", // ← Hérite en bas
                          borderRight: "none", // ← PAS de bordure à droite
                        }}
                      >
                        {item.type}
                      </td>

                      {/* Cellules du milieu - pas de bordures latérales */}
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          width: "35%",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none", // ← PAS de bordure
                          borderRight: "none", // ← PAS de bordure
                        }}
                      >
                        {item.type === "Catalogue"
                          ? produitsSimules.find(
                              (p) => p.id === item.article_id,
                            )?.designation
                          : item.articleHorsCatalogue}
                      </td>

                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {sousFamilles.find((sf) => sf.id === item.famille)
                          ?.designation || "Medicament"}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {item.quantite}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {item.consoMoyenne}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {pvHT.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {totalHT.toLocaleString()}
                      </td>

                      <td
                        style={{
                          padding: "6px 8px",
                          borderTopRightRadius: "8px",
                          borderBottomRightRadius: "8px",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderRight: "inherit",
                          borderLeft: "none",
                          position: "sticky",
                          right: 0,
                          backgroundColor: "white",
                          zIndex: 5,
                          boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeProduct(idx)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                    // 5. SUPPRIMER le <div className="m-2"></div> d'après
                  );
                })}
              </tbody>

              {/* 6. Nettoyer le tfoot - supprimer le <div> */}
              <tfoot>
                <tr style={{ backgroundColor: "#E6F4EA" }}>
                  <td
                    colSpan={7} // Changer de 6 à 7
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: "bold",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                    }}
                  >
                    Total HT → {totalCommandeHT.toLocaleString()}
                  </td>
                  <td
                    style={{
                      backgroundColor: "#E6F4EA",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                    }}
                  ></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Section Commentaire */}
      <CommentInput
        value={commande.commentaire}
        onChange={(value) =>
          setCommande((prev) => ({ ...prev, commentaire: value }))
        }
        placeholder="Ajouter un commentaire à votre commande..."
      />

      <button
        className="btn btn-success w-100 py-2"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <output
              className="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            ></output>
            Envoi en cours...
          </>
        ) : (
          <>
            <FaCheck className="me-2" /> Valider la commande RC Privé
          </>
        )}
      </button>

      {/* Modal de confirmation de changement de client */}
      <ConfirmationModal
        show={showClientChangeModal}
        onClose={() => {
          setShowClientChangeModal(false);
          setPendingClientId(null);
        }}
        onConfirm={() => {
          if (pendingClientId !== null) {
            setCommande((prev) => ({
              ...prev,
              client_id: pendingClientId,
              lignecommandes: [],
            }));
          }
          setShowClientChangeModal(false);
          setPendingClientId(null);
        }}
        title="Changement de client"
        message="Changer de client effacera votre commande actuelle. Voulez-vous continuer ?"
        confirmText="Confirmer"
        cancelText="Annuler"
        variant="warning"
      />

      {/* Modal de récupération de prix */}
      <PriceFetchingModal
        show={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        isLoading={isFetchingPrice}
        priceValue={fetchedPrice}
        articleName={currentArticleName}
      />

      <OrderAddingModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          if (orderStatus === "success") {
            navigate("/orders_client?type=rc_prive");
          }
        }}
        status={orderStatus}
        errorMessage={orderError}
        successMessage="Commande RC Privé enregistrée et envoyée avec succès !"
        redirectPath="/orders_client?type=rc_prive"
      />
    </div>
  );
};

export default CommandeRC;
