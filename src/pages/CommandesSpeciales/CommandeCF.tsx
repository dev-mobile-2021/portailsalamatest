import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useUserhook";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useArticles } from "../../hooks/useArticles";
import SmallHeader from "../../components/const/SmallHeader";
import InfoDisplay from "../../components/InfoDisplay";
import SelectDisplay from "../../components/SelectDisplay";
import { useNotification } from "../../hooks/useNotification";
import { useSousFamilles } from "../../hooks/useSousFamilles"; // Import du hook pour les sous-familles
import { createItem } from "../../api/crudService"; // Import du service pour créer une commande
import Select from "react-select";
import back_icon from "../../assets/images/back.png";
import ClientSelect from "../../components/ClientSelect";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";
import CommentInput from "../../components/ui/CommentInput";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import OrderAddingModal from "../../components/ui/OrderAddingModal";

const CommandeCF = () => {
  const navigate = useNavigate();
  const {} = useNotification();
  const { user } = useAuthContext();

  // État pour le modal de confirmation de changement de client
  const [showClientChangeModal, setShowClientChangeModal] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<number | null>(null);

  // État pour le loader de soumission
  // État pour le loader de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour le modal d'ajout de commande
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [orderError, setOrderError] = useState("");

  const [currentProduct, setCurrentProduct] = useState({
    article_id: null as number | null,
    articleHorsCatalogue: "",
    famille: "" as string, // Explicitly typed as string
    quantite: 0,
    avg: 0,
    conditionnement: 1,
    pvht: 0,
    type: "Catalogue", // 'Catalogue' ou 'Hors catalogue'
  });

  const [commande, setCommande] = useState({
    datereception: "",
    campagne_id: null,
    client_id: null as number | null,
    client: user?.name || "Client connecté",
    lignecommandes: [] as {
      article_id: number;
      articleHorsCatalogue?: string;
      famille?: string;
      quantite: number;
      avg: number;
      conditionnement: number;
      pvht: number;
      type?: string;
    }[],
    commentaire: "",
  });

  // Utilisation du hook useArticles pour récupérer les articles avec TCLCOD_0: 1 et client_id
  const { articles: allProducts, error: errorArticles } = useArticles({
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

  // Plafond et encours client (exemple statique)
  // const plafondAutorise = 7000000000;
  // const encours = 570000000;
  // const solde = plafondAutorise - encours;

  useEffect(() => {
    if (!user?.client_id) return;
    setCommande((prev) =>
      prev.client_id === null
        ? { ...prev, client_id: user.client_id, client: user.name }
        : prev,
    );
  }, [user]);

  const handleAddProduct = () => {
    if (
      currentProduct.type === "Catalogue" &&
      currentProduct.quantite % currentProduct.conditionnement !== 0
    ) {
      toast.error(
        `La quantité doit être un multiple de ${currentProduct.conditionnement} pour ce produit.`,
      );
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

    // Créer un nouveau produit avec les bonnes propriétés selon le type
    const newProduct = {
      article_id: currentProduct.article_id || 0, // 0 pour produit hors catalogue
      quantite: currentProduct.quantite,
      avg: currentProduct.avg,
      conditionnement: currentProduct.conditionnement,
      pvht: currentProduct.pvht,
      articleHorsCatalogue:
        currentProduct.type === "Hors catalogue"
          ? currentProduct.articleHorsCatalogue
          : undefined,
      famille:
        currentProduct.type === "Hors catalogue"
          ? currentProduct.famille
          : undefined,
      type: currentProduct.type,
    };

    const index = commande.lignecommandes.findIndex(
      (item: any) =>
        (currentProduct.type === "Catalogue" &&
          item.article_id === currentProduct.article_id) ||
        (currentProduct.type === "Hors catalogue" &&
          item.articleHorsCatalogue === currentProduct.articleHorsCatalogue),
    );

    let updatedCommandes = [...commande.lignecommandes];
    if (index !== -1) {
      updatedCommandes[index] = newProduct;
      toast.success("Produit mis à jour !");
    } else {
      updatedCommandes.push(newProduct);
      toast.success("Produit ajouté !");
    }

    setCommande({ ...commande, lignecommandes: updatedCommandes });
    setCurrentProduct({
      article_id: null,
      articleHorsCatalogue: "",
      famille: "",
      quantite: 0,
      avg: 0,
      conditionnement: 10,
      pvht: 0,
      type: currentProduct.type,
    });
  };

  // const handleProductSelect = (id: number) => {
  //   const produit = allProducts.find((p) => p.id === id);
  //   if (!produit) return;

  //   setCurrentProduct({
  //     ...currentProduct,
  //     article_id: id,
  //     articleHorsCatalogue: "",
  //     famille: "",
  //     conditionnement: produit.conditionnement || 10,
  //     pvht: produit.pvht || 0,
  //   });
  // };

  const removeProduct = (idx: number) => {
    const updated = [...commande.lignecommandes];
    updated.splice(idx, 1);
    setCommande({ ...commande, lignecommandes: updated });
    toast.success("Produit supprimé !");
  };

  const totalCommandeHT = commande.lignecommandes.reduce(
    (sum, item) => sum + item.quantite * item.pvht,
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
        typecommande_id: 4, // Type de commande spécifique pour CF
        commentaire: commande.commentaire || undefined,
        detailcommandes: articlesComplets.map((detail) => ({
          article_id:
            detail.type === "Hors catalogue" ? null : detail.article_id,
          quantite: detail.quantite,
          cmm: detail.avg, // Consommation moyenne par mois
          catalogue: detail.type === "Catalogue" ? 1 : 0,
          pv_ht: detail.pvht || 0,
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
      // showSuccess("Succès", "Commande enregistrée et envoyée avec succès !");

      // Ajouter un délai avant la navigation pour permettre au toast de s'afficher
      // setTimeout(() => {
      //   console.log("Redirection vers la page des commandes client...");
      //   navigate("/orders_client");
      // }, 3000);
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement ou de l'envoi de la commande :",
        error,
      );
      const details = extractApiErrorMessage(error);
      setOrderStatus("error");
      setOrderError(
        "Une erreur s'est produite lors de l'envoi de la commande." +
          (details ? ` Détails : ${details}` : ""),
      );
      // showError(
      //   "Erreur",
      //   "Une erreur s'est produite lors de l'envoi de la commande." +
      //     (details ? ` Détails : ${details}` : ""),
      // );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remplacement de la liste statique par les sous-familles dynamiques
  const { sousFamilles, loading, error } = useSousFamilles();

  // Remplacement de sousFamillesSimulees par sousFamillesOptions
  const sousFamillesOptions = sousFamilles.map((f) => ({
    value: f.id, // Assuming SousFamille has an id field
    label: f.designation, // Corrected to match SousFamille type
  }));

  if (loading) {
    return <div>Chargement des sous-familles...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "80vw" }}>
      <div className="greenSadow">
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
              Expression des besoins → Commande CF
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
          <div className="d-flex align-items-center mt-4">
            <div className="form-check form-check-inline checkbox">
              <input
                className="form-check-input"
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
              >
                En catalogue
              </label>
            </div>
            <div className="form-check form-check-inline checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                style={{ transform: "scale(1.5)" }}
                checked={currentProduct.type === "Hors catalogue"}
                onChange={() =>
                  setCurrentProduct({
                    ...currentProduct,
                    type: "Hors catalogue",
                    article_id: null,
                  })
                }
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "10px" }}
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
              options={allProducts.map((p) => ({
                value: p.id,
                label: p.designation,
              }))}
              value={
                allProducts
                  .map((p) => ({ value: p.id, label: p.designation }))
                  .find((opt) => opt.value === currentProduct.article_id) ||
                null
              }
              onChange={(selected) => {
                const article = allProducts.find(
                  (p: any) => p.id === selected?.value,
                );
                if (article) {
                  setCurrentProduct({
                    ...currentProduct,
                    article_id: article.id,
                    conditionnement: article.conditionnement || 10,
                    pvht: article.pvht || 0,
                  });
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
                  famille: String(value), // Convert to string explicitly
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
            label="Quantité demandée"
            type="number"
            value={currentProduct.quantite}
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                quantite: Number(e.target.value),
              })
            }
            width={"100%"}
            isEnabled={true}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />
          {currentProduct.quantite > 0 &&
            currentProduct.type === "Catalogue" &&
            currentProduct.quantite % currentProduct.conditionnement !== 0 && (
              <small className="text-danger">
                La quantité doit être un multiple de{" "}
                {currentProduct.conditionnement}
              </small>
            )}
        </div>
        <div className="col-md-4">
          <InfoDisplay
            label="Conso moyenne / mois"
            value={currentProduct.avg}
            type="number"
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
            width={"100%"}
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                avg: Number(e.target.value),
              })
            }
            isEnabled={true}
          />
        </div>
        <div className="col-md-4">
          <InfoDisplay
            label="Prix"
            type="number"
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
            width={"100%"}
            value={currentProduct.pvht}
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                pvht: Number(e.target.value),
              })
            }
            isEnabled={true}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-success p-3 mb-4" onClick={handleAddProduct}>
          <FaPlusCircle className="me-2" /> Ajouter un produit
        </button>
      </div>

      {commande.lignecommandes.length > 0 && (
        <div className="card w-full p-4 mb-5" style={{ borderRadius: "8px" }}>
          <div className="overflow-x-auto rounded-lg">
            <table
              className="w-full bg-white"
              style={{
                width: "100%",
                border: "none",
                borderCollapse: "separate",
                borderSpacing: "0 12px",
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
                      textAlign: "center",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Quantité demandée
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Conso Moyenne
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Prix
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                      width: "12.5%",
                    }}
                  >
                    Total HT
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
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
              <tbody>
                {commande.lignecommandes.map((item, idx) => {
                  const pvHT = item.pvht;
                  const totalHT = item.quantite * pvHT;
                  return (
                    <tr
                      key={idx}
                      style={{
                        height: "60px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTopLeftRadius: "8px",
                          borderBottomLeftRadius: "8px",
                          borderLeft: "inherit",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderRight: "none",
                        }}
                      >
                        {item.type}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          width: "35%",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          borderLeft: "none",
                          borderRight: "none",
                        }}
                      >
                        {item.type === "Catalogue"
                          ? allProducts.find((p) => p.id === item.article_id)
                              ?.designation
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
                          textAlign: "center",
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
                          textAlign: "center",
                          borderRight: "none",
                        }}
                      >
                        {item.avg}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#4A5568",
                          borderTop: "inherit",
                          borderBottom: "inherit",
                          textAlign: "center",
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
                          textAlign: "center",
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
                          textAlign: "center",
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
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#E6F4EA" }}>
                  <td
                    colSpan={7}
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
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Envoi en cours...
          </>
        ) : (
          <>
            <FaCheck className="me-2" /> Valider la commande CF
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

      <OrderAddingModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          if (orderStatus === "success") {
            navigate("/orders_client?type=ferme");
          }
        }}
        status={orderStatus}
        errorMessage={orderError}
        successMessage="Commande CF enregistrée et envoyée avec succès !"
        redirectPath="/orders_client?type=ferme"
      />
    </div>
  );
};

export default CommandeCF;
