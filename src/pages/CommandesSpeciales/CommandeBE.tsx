import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/variable";
import { useAuthContext } from "../../hooks/useUserhook";
import { useArticles } from "../../hooks/useArticles";
import useTarifSage from "../../hooks/useTarifSage";
import useClients from "../../hooks/useClients";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import SmallHeader from "../../components/const/SmallHeader";
import InfoDisplay from "../../components/InfoDisplay";
import Select from "react-select";

import { createItem } from "../../api/crudService"; // Correction de l'importation
import back_icon from "../../assets/images/back.png";
import ClientSelect from "../../components/ClientSelect";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";
import CommentInput from "../../components/ui/CommentInput";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PriceFetchingModal from "../../components/ui/PriceFetchingModal";
import OrderAddingModal from "../../components/ui/OrderAddingModal";

// Ajout des propriétés manquantes dans les types
interface DetailCommande {
  article_id: number | null;
  quantite: number;
  avg: number;
  conditionnement: number;
  pvht: number;
  cmm?: number;
  catalogue?: number;
  famille_id?: number;
  article_text?: string;
}

interface Commande {
  id?: number;
  datereception: string;
  campagne_id: number | null;
  client_id: number | null;
  lignecommandes: DetailCommande[];
  commentaire: string;
}

const CommandeBE = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { fetchTarif, loading: loadingTarif } = useTarifSage();
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

  // Utilisation du hook useArticles pour récupérer les articles avec TCLCOD_0: 1 et client_id
  const {
    articles: allProducts,
    loading: loadingArticles,
    error: errorArticles,
  } = useArticles({
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

  // Define a type for the product that ensures article_id is a number when passed to lignecommandes

  const [currentProduct, setCurrentProduct] = useState({
    article_id: null as number | null,
    quantite: 0,
    avg: 0,
    conditionnement: 1,
    pvht: 0,
  });

  const [commande, setCommande] = useState<Commande>({
    datereception: "",
    campagne_id: null,
    client_id: null as number | null,
    lignecommandes: [] as DetailCommande[],
    commentaire: "",
  });

  // Plafond, encours, solde et budget (exemple statique)
  const plafondAutorise = 7000000000;
  const encours = 570000000;
  const solde = plafondAutorise - encours;
  const plafondAutoriseb = 8000000000;

  useEffect(() => {
    if (!user?.client_id) return;

    // Ne pas écraser un choix manuel de client
    setCommande((prev) =>
      prev.client_id === null ? { ...prev, client_id: user.client_id } : prev,
    );
  }, [user]);

  const handleAddProduct = () => {
    if (!currentProduct.article_id || currentProduct.quantite <= 0) {
      toast.error(
        "Veuillez sélectionner un produit et saisir une quantité valide",
      );
      return;
    }

    if (currentProduct.quantite % currentProduct.conditionnement !== 0) {
      toast.error(
        `La quantité doit être un multiple de ${currentProduct.conditionnement} pour ce produit.`,
      );
      return;
    }

    const existingProductIndex = commande.lignecommandes.findIndex(
      (item) => item.article_id === currentProduct.article_id,
    );

    // Ensure article_id is not null before proceeding
    if (currentProduct.article_id === null) {
      toast.error("L'article sélectionné n'est pas valide");
      return;
    }

    // Now currentProduct.article_id is definitely a number (not null)
    const productWithValidId = {
      ...currentProduct,
      article_id: currentProduct.article_id as number, // This cast helps TypeScript understand
    };

    if (existingProductIndex >= 0) {
      // Changed from !== -1 to >= 0 to fix lint warning
      const updatedDetails = [...commande.lignecommandes];
      updatedDetails[existingProductIndex] = productWithValidId;
      setCommande((prev) => ({ ...prev, lignecommandes: updatedDetails }));
    } else {
      setCommande((prev) => ({
        ...prev,
        lignecommandes: [...prev.lignecommandes, productWithValidId],
      }));
    }

    setCurrentProduct({
      article_id: null,
      quantite: 0,
      avg: 0,
      conditionnement: 10,
      pvht: 0,
    });

    toast.success("Produit ajouté avec succès !");
  };

  // const updateArticleField = (article_id: number, field: string, value: any) => {
  //     setCommande(prev => {
  //         const updatedDetails = prev.lignecommandes.map(item =>
  //             item.article_id === article_id ? { ...item, [field]: value } : item
  //         );
  //         return { ...prev, lignecommandes: updatedDetails };
  //     });
  // };

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

    // setIsSubmitting(true); // Géré par le modal
    // Afficher le modal de chargement
    setShowOrderModal(true);
    setOrderStatus("loading");
    setOrderError("");

    try {
      const payload = {
        datecommande:
          commande.datereception || new Date().toISOString().split("T")[0],
        client_id: clientIdToUse,
        user_id: user?.id,
        typecommande_id: 5, // Type de commande BE
        commentaire: commande.commentaire || undefined,
        detailcommandes: articlesComplets.map((detail) => ({
          article_id: detail.article_id,
          quantite: detail.quantite,
          cmm: detail.avg, // Consommation moyenne par mois
          pv_ht: detail.pvht || 0,
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

  const removeProduct = (article_id: number | null) => {
    if (article_id === null) {
      console.error("L'article sélectionné n'a pas d'identifiant valide.");
      toast.error("L'article sélectionné n'est pas valide.");
      return;
    }

    const confirmDelete = globalThis.confirm(
      `Êtes-vous sûr de vouloir supprimer ce produit ?`,
    );
    if (!confirmDelete) return;

    setCommande((prev) => ({
      ...prev,
      lignecommandes: prev.lignecommandes.filter(
        (item) => item.article_id !== article_id,
      ),
    }));
    toast.success("Produit supprimé");
  };

  const totalCommandeHT = commande.lignecommandes.reduce(
    (sum, item) => sum + item.quantite * item.pvht,
    0,
  );

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
              Expression des besoins → Commande BE
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
        <div className="d-flex justify-content-between mb-4 gap-2">
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

          {/* Conserver les informations de budget spécifiques à CommandeBE */}
          <InfoDisplay
            label="Budget autorisé"
            value={plafondAutoriseb.toLocaleString()}
            isEnabled={false}
            width={"100%"}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />
          <InfoDisplay
            label="Consommation"
            value={encours.toLocaleString()}
            isEnabled={false}
            width={"100%"}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />
          <InfoDisplay
            label="Solde"
            value={solde.toLocaleString()}
            isEnabled={false}
            width={"100%"}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <Select
            placeholder={
              loadingArticles
                ? "Chargement des articles..."
                : "Sélectionner un article..."
            }
            isDisabled={loadingArticles || loadingTarif}
            options={allProducts.map((p) => ({
              value: p.id,
              label: p.designation,
            }))}
            value={
              allProducts
                .map((p) => ({ value: p.id, label: p.designation }))
                .find((opt) => opt.value === currentProduct.article_id) || null
            }
            onChange={async (selected) => {
              const article = allProducts.find((p) => p.id === selected?.value);
              if (article) {
                // Afficher le modal et commencer le chargement
                setCurrentArticleName(article.designation);
                setShowPriceModal(true);
                setIsFetchingPrice(true);
                setFetchedPrice(null);

                try {
                  // Récupérer le codecategorie du client sélectionné
                  const selectedClient = clients.find(
                    (c) => c.id === commande.client_id,
                  );
                  const codeCategorie = selectedClient?.codecategorie || "";

                  // Appeler l'API pour récupérer le tarif
                  const tarifData = await fetchTarif(
                    article.code || "",
                    codeCategorie,
                  );
                  const prixAPI = tarifData?.prix;
                  const finalPrice =
                    prixAPI ?? article.pvht ?? article.prix ?? 0;

                  // Mettre à jour l'état du modal
                  setFetchedPrice(finalPrice);
                  setIsFetchingPrice(false);

                  setCurrentProduct({
                    ...currentProduct,
                    article_id: article.id,
                    conditionnement: article.conditionnement || 10,
                    pvht: finalPrice,
                  });

                  // Auto-fermer le modal après 2 secondes si le prix est récupéré avec succès
                  if (finalPrice > 0) {
                    setTimeout(() => {
                      setShowPriceModal(false);
                    }, 2000);
                  }
                } catch (error) {
                  console.error(
                    "Erreur lors de la récupération du tarif:",
                    error,
                  );

                  // Afficher l'erreur dans le modal
                  setFetchedPrice(0);
                  setIsFetchingPrice(false);

                  // En cas d'erreur, utiliser le prix de l'article
                  setCurrentProduct({
                    ...currentProduct,
                    article_id: article.id,
                    conditionnement: article.conditionnement || 10,
                    pvht: article.pvht || article.prix || 0,
                  });
                }
              }
            }}
            isClearable
            isSearchable
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <InfoDisplay
            label="Qté"
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
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
            width={"100%"}
            value={currentProduct.pvht}
            isEnabled={false}
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
                      width: "40%",
                    }}
                  >
                    Produit
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "15%",
                    }}
                  >
                    Qté
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "15%",
                    }}
                  >
                    Conso Moyenne
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "15%",
                    }}
                  >
                    Prix
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      width: "15%",
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
                  const article = allProducts.find(
                    (p) => p.id === item.article_id,
                  );
                  const pvHT = item.pvht;
                  const totalHT = item.quantite * pvHT;
                  return (
                    <tr
                      key={`order-${item.article_id}-${idx}`}
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
                        <div className="d-flex align-items-center">
                          {article?.image && (
                            <img
                              src={BASE_URL + article.image}
                              alt={article.designation}
                              className="rounded-3 me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <span>
                            {article?.designation || "Produit inconnu"}
                          </span>
                        </div>
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
                        {item.avg}
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
                          onClick={() => removeProduct(item.article_id)}
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
                    colSpan={5}
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
            <FaCheck className="me-2" /> Valider la commande BE
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
            navigate("/orders_client?type=be");
          }
        }}
        status={orderStatus}
        errorMessage={orderError}
        successMessage="Commande BE enregistrée et envoyée avec succès !"
        redirectPath="/orders_client?type=be"
      />
    </div>
  );
};

export default CommandeBE;
