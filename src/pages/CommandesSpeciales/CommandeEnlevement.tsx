import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useUserhook";
import {
  FaCheck,
  FaPlusCircle,
  FaBox,
  FaClipboardList,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useArticles } from "../../hooks/useArticles";
import useTarifSage from "../../hooks/useTarifSage";
import useClients from "../../hooks/useClients";
import { Card, Badge, Button, Modal } from "react-bootstrap";
import SmallHeader from "../../components/const/SmallHeader";
import InfoDisplay from "../../components/InfoDisplay";
import SelectDisplay from "../../components/SelectDisplay";
import { useNotification } from "../../hooks/useNotification";
import { useSousFamilles } from "../../hooks/useSousFamilles";
import { createItem } from "../../api/crudService";
import back_icon from "../../assets/images/back.png";
import ClientSelect from "../../components/ClientSelect";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";
import CommentInput from "../../components/ui/CommentInput";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PriceFetchingModal from "../../components/ui/PriceFetchingModal";
import OrderAddingModal from "../../components/ui/OrderAddingModal";
const CommandeEnlevement = () => {
  const navigate = useNavigate();
  const {} = useNotification();

  // État pour le modal de récupération de prix
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [currentArticleName, setCurrentArticleName] = useState("");

  const [currentProduct, setCurrentProduct] = useState({
    article_id: null as number | null,
    produit: "",
    code: "",
    unite: "",
    articleHorsCatalogue: "",
    famille: "" as string,
    qte_debut: 0,
    qte_recue: 0,
    qte_distribuee: 0,
    qte_perdue: 0,
    ajustement: 0,
    qte_fin: 0,
    lignesLot: [] as any[],
    nb_jour_rupture: 0,
    cmm: 0,
    stock_max: 0,
    qte_commander_l: 0,
    qte_commandee: 0,
    msd: 0,
    quantite: 0,
    avg: 0,
    conditionnement: 10,
    pvht: 0,
    type: "Catalogue",
  });

  const { user } = useAuthContext();
  const { fetchTarif } = useTarifSage();
  const { clients } = useClients(user?.id || null);

  const [commande, setCommande] = useState({
    datereception: "",
    campagne_id: null,
    client_id: null as number | null,
    lignecommandes: [] as any[],
    documents: [] as File[],
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

  useEffect(() => {
    if (!user?.client_id) return;
    setCommande((prev) =>
      prev.client_id === null ? { ...prev, client_id: user.client_id } : prev,
    );
  }, [user]);

  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedLots, setSelectedLots] = useState<any[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);

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

  useEffect(() => {
    if (!user?.client_id) return;
    setCommande((prev) =>
      prev.client_id === null ? { ...prev, client_id: user.client_id } : prev,
    );
  }, [user]);

  const handleAddProduct = () => {
    if (
      (currentProduct.type === "Catalogue" && !currentProduct.article_id) ||
      (currentProduct.type === "Hors catalogue" &&
        !currentProduct.articleHorsCatalogue)
    ) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }
    if (
      !currentProduct.qte_commander_l ||
      currentProduct.qte_commander_l <= 0
    ) {
      toast.error("Veuillez saisir une quantité à commander");
      return;
    }

    const newProduct = {
      id: Date.now(),
      article_id: currentProduct.article_id || 0,
      produit:
        currentProduct.type === "Catalogue"
          ? currentProduct.produit
          : currentProduct.articleHorsCatalogue,
      code: currentProduct.code,
      unite: currentProduct.unite,
      qte_debut: currentProduct.qte_debut,
      qte_recue: currentProduct.qte_recue,
      qte_distribuee: currentProduct.qte_distribuee,
      qte_perdue: currentProduct.qte_perdue,
      ajustement: currentProduct.ajustement,
      qte_fin: currentProduct.qte_fin,
      lignesLot: [...currentProduct.lignesLot],
      nb_jour_rupture: currentProduct.nb_jour_rupture,
      cmm: currentProduct.cmm,
      stock_max: currentProduct.stock_max,
      qte_commander_l: currentProduct.qte_commander_l,
      qte_commandee: currentProduct.qte_commandee,
      msd: currentProduct.msd,
      articleHorsCatalogue:
        currentProduct.type === "Hors catalogue"
          ? currentProduct.articleHorsCatalogue
          : undefined,
      famille:
        currentProduct.type === "Hors catalogue"
          ? currentProduct.famille
          : undefined,
      type: currentProduct.type,
      pvht: currentProduct.pvht,
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
      produit: "",
      code: "",
      unite: "",
      articleHorsCatalogue: "",
      famille: "",
      qte_debut: 0,
      qte_recue: 0,
      qte_distribuee: 0,
      qte_perdue: 0,
      ajustement: 0,
      qte_fin: 0,
      lignesLot: [],
      nb_jour_rupture: 0,
      cmm: 0,
      stock_max: 0,
      qte_commander_l: 0,
      qte_commandee: 0,
      msd: 0,
      quantite: 0,
      avg: 0,
      conditionnement: 10,
      pvht: 0,
      type: currentProduct.type,
    });
  };

  const handleShowLotDetails = (
    lots: any[],
    productName: string,
    productIndex?: number,
  ) => {
    setSelectedLots([...lots]);
    setSelectedProductName(productName);
    setSelectedProductIndex(productIndex ?? null);
    setShowLotModal(true);
  };

  const handleCloseLotModal = () => {
    setShowLotModal(false);
    setSelectedLots([]);
    setSelectedProductName("");
    setSelectedProductIndex(null);
  };

  const handleSaveLotChanges = () => {
    if (selectedProductIndex !== null) {
      setCommande((prev) => ({
        ...prev,
        lignecommandes: prev.lignecommandes.map((prod, idx) =>
          idx === selectedProductIndex
            ? { ...prod, lignesLot: selectedLots }
            : prod,
        ),
      }));
    }
    handleCloseLotModal();
  };

  const handleUpdateLot = (lotIndex: number, field: string, value: any) => {
    const updatedLots = [...selectedLots];
    updatedLots[lotIndex] = { ...updatedLots[lotIndex], [field]: value };
    setSelectedLots(updatedLots);
  };

  const handleAddLot = () => {
    const newLot = {
      id: Date.now(),
      lot: "",
      quantite: 0,
      date_peremption: "",
    };
    setSelectedLots([...selectedLots, newLot]);
  };

  const handleRemoveLot = (lotIndex: number) => {
    const updatedLots = selectedLots.filter((_, index) => index !== lotIndex);
    setSelectedLots(updatedLots);
  };

  const removeProduct = (idx: number) => {
    const updated = [...commande.lignecommandes];
    updated.splice(idx, 1);
    setCommande({ ...commande, lignecommandes: updated });
    toast.success("Produit supprimé !");
  };

  const calculateDerivedValues = (prod: any) => {
    const D = Number(prod.qte_debut || 0);
    const E = Number(prod.qte_recue || 0);
    const F = Number(prod.qte_distribuee || 0);
    const G = Number(prod.qte_perdue || 0);
    const H = Number(prod.ajustement || 0);
    // const J = Number(prod.nb_jour_rupture || 0);

    const I = D + E - (F + G + H);
    const K = Number(prod.cmm || 0);
    const L = K * 3;

    // M (Quantité à commander) = L - I (ne peut pas être négative)
    const M = Math.max(0, L - I);

    // N (Quantité commandée arrondie au conditionnement)
    const N = M > 0 ? Math.ceil(M) : 0;

    return {
      qte_fin: I,
      stock_max: L,
      qte_commander_l: M,
      qte_commandee: N,
    };
  };

  const updateProductField = (id: number, field: string, value: any) => {
    setCommande((prev) => ({
      ...prev,
      lignecommandes: prev.lignecommandes.map((prod) => {
        if (prod.id === id) {
          const updated = { ...prod, [field]: value };
          const derived = calculateDerivedValues(updated);

          // Si le champ modifié est qte_commander_l, ne pas écraser avec la valeur calculée
          if (field === "qte_commander_l") {
            return {
              ...updated,
              ...derived,
              qte_commander_l: value,
              qte_commandee: value > 0 ? Math.ceil(value) : 0,
            };
          }

          return { ...updated, ...derived };
        }
        return prod;
      }),
    }));
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const maxSize = 5 * 1024 * 1024;
  //     const files = Array.from(e.target.files);

  //     const oversizedFiles = files.filter((file) => file.size > maxSize);
  //     if (oversizedFiles.length > 0) {
  //       toast.error(`Fichier(s) trop volumineux: max 5MB par fichier`);
  //       return;
  //     }

  //     setCommande((prev) => ({ ...prev, documents: files }));
  //     toast.info(
  //       `${files.length} document${files.length > 1 ? "s" : ""} sélectionné${
  //         files.length > 1 ? "s" : ""
  //       }`
  //     );
  //   }
  // };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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

    if (commande.lignecommandes.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à votre commande");
      return;
    }

    // Vérifier que tous les articles ont une quantité à commander > 0
    const articlesAvecQteZero = commande.lignecommandes.filter(
      (a) => !a.qte_commandee || a.qte_commandee <= 0,
    );
    if (articlesAvecQteZero.length > 0) {
      toast.error(
        `${articlesAvecQteZero.length} article(s) ont une quantité à commander de 0. Veuillez saisir une quantité pour tous les articles.`,
      );
      return;
    }

    const articlesComplets = commande.lignecommandes;

    // setIsSubmitting(true);
    // Afficher le modal de chargement
    setShowOrderModal(true);
    setOrderStatus("loading");
    setOrderError("");

    try {
      const payload = {
        client_id: clientIdToUse,
        user_id: user?.id,
        typecommande_id: 8, // Commande Enlèvement
        commentaire: commande.commentaire || undefined,
        detailcommandes: articlesComplets.map((detail) => ({
          article_id:
            detail.type === "Hors catalogue" ? undefined : detail.article_id,
          qte_debut: detail.qte_debut,
          qte_recue: detail.qte_recue,
          qte_distribuee: detail.qte_distribuee,
          qte_perdue: detail.qte_perdue,
          ajustement: detail.ajustement,
          qte_fin: detail.qte_fin,
          cmm: detail.cmm,
          stock_max: detail.stock_max,
          quantite: detail.qte_commandee,
          qte_commandee: detail.qte_commandee,
          nb_jour_rupture: detail.nb_jour_rupture,
          msd: detail.msd,
          catalogue: detail.type === "Catalogue" ? 1 : 0,
          famille_id:
            detail.type === "Hors catalogue" ? detail.famille : undefined,
          article_text:
            detail.type === "Hors catalogue"
              ? detail.articleHorsCatalogue
              : undefined,
          pv_ht: 100,
          lignesLot:
            detail.lignesLot?.map(
              (lot: {
                lot: string;
                date_peremption: string;
                quantite: number;
              }) => ({
                lot: lot.lot,
                dateperemption: lot.date_peremption,
                quantite: lot.quantite,
              }),
            ) || [],
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
        "Une erreur s'est produite lors de l'enregistrement ou de l'envoi de la commande." +
          (details ? ` Détails : ${details}` : ""),
      );
      // showError(
      //   "Erreur",
      //   "Une erreur s'est produite lors de l'enregistrement ou de l'envoi de la commande." +
      //     (details ? ` Détails : ${details}` : ""),
      // );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { sousFamilles, loading, error } = useSousFamilles();

  const encours = 570000000;

  if (loading) {
    return <div>Chargement des sous-familles...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  const sousFamillesOptions = sousFamilles.map((f) => ({
    value: f.id,
    label: f.designation,
  }));

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
              Expression des besoins → Commande Enlèvement
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

        <div className="d-flex  justify-content-between align-items-center mb-4 gap-2">
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
            width={"100%"}
            inputStyle={{ backgroundColor: "#F6F6F6" }}
            labelStyle={{ color: "#CBCBCB" }}
          />

          {/* <div className="d-flex flex-column">
            <label className="form-label fw-bold" style={{ color: "#CBCBCB" }}>
              <FaUpload className="me-2" /> Lettre de demande
            </label>
            <div
              className="custom-file-input"
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
                style={{ backgroundColor: "#F6F6F6", border: "none" }}
              />
            </div>
            {commande.documents.length > 0 && (
              <small className="text-success mt-1">
                {commande.documents.length} document(s) sélectionné(s)
              </small>
            )}
          </div> */}

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
                    famille: "",
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
        <div className="mb-3">
          <div className="mb-3">
            <label
              className="form-label d-flex align-items-center mb-2"
              style={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "0.95rem",
                letterSpacing: "0.3px",
              }}
            >
              <FaBox
                className="me-2"
                style={{ color: "#1FB05B", fontSize: "18px" }}
              />
              Article du catalogue
            </label>
            <Select
              placeholder="Rechercher et sélectionner un article..."
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
              onChange={async (selected) => {
                const article = allProducts.find(
                  (p) => p.id === selected?.value,
                );
                if (article) {
                  setCurrentArticleName(article.designation);
                  setShowPriceModal(true);
                  setIsFetchingPrice(true);
                  setFetchedPrice(null);

                  try {
                    const selectedClient = clients.find(
                      (c) => c.id === commande.client_id,
                    );
                    const codeCategorie = selectedClient?.codecategorie || "";
                    const tarifData = await fetchTarif(
                      article.code || "",
                      codeCategorie,
                    );
                    const prixAPI = tarifData?.prix;
                    const finalPrice =
                      prixAPI ?? article.pvht ?? article.prix ?? 0;

                    setFetchedPrice(finalPrice);
                    setIsFetchingPrice(false);

                    setCurrentProduct({
                      ...currentProduct,
                      article_id: article.id,
                      produit: article.designation,
                      code:
                        article.code ||
                        `P-${article.id.toString().padStart(3, "0")}`,
                      unite: (article.unite as string) || "Unité",
                      conditionnement: article.conditionnement || 10,
                      pvht: finalPrice,
                    });

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
                    setFetchedPrice(0);
                    setIsFetchingPrice(false);
                    setCurrentProduct({
                      ...currentProduct,
                      article_id: article.id,
                      produit: article.designation,
                      code:
                        article.code ||
                        `P-${article.id.toString().padStart(3, "0")}`,
                      unite: (article.unite as string) || "Unité",
                      conditionnement: article.conditionnement || 10,
                      pvht: article.pvht || article.prix || 0,
                    });
                  }
                }
              }}
              isClearable
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "52px",
                  borderRadius: "10px",
                  border: state.isFocused
                    ? "2px solid #1FB05B"
                    : "1px solid #e2e8f0",
                  boxShadow: state.isFocused
                    ? "0 0 0 3px rgba(31,176,91,0.08)"
                    : "none",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#1FB05B" },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#1FB05B"
                    : state.isFocused
                      ? "#f0fdf4"
                      : "white",
                  color: state.isSelected ? "white" : "#1e293b",
                  padding: "12px 16px",
                  fontWeight: state.isSelected ? "600" : "normal",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                }),
                placeholder: (base) => ({ ...base, color: "#94a3b8" }),
                singleValue: (base) => ({
                  ...base,
                  color: "#1e293b",
                  fontWeight: "600",
                }),
              }}
              noOptionsMessage={() => "Aucun article trouvé"}
            />
          </div>

          <div className="d-flex align-items-end gap-3">
            <div style={{ flex: 1, maxWidth: "260px" }}>
              <label
                className="form-label mb-2"
                style={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.95rem",
                }}
              >
                Qté à commander *
              </label>
              <input
                type="number"
                className="form-control fw-bold"
                value={currentProduct.qte_commander_l || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    qte_commander_l: Number(e.target.value),
                    qte_commandee: Number(e.target.value) > 0 ? Math.ceil(Number(e.target.value)) : 0,
                  })
                }
                placeholder="Quantité"
                min={1}
                style={{
                  height: "52px",
                  borderRadius: "10px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  color: "#856404",
                }}
              />
            </div>
            <div style={{ flex: 1, maxWidth: "260px" }}>
              <label
                className="form-label mb-2"
                style={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.95rem",
                }}
              >
                Tarif
              </label>
              <input
                type="number"
                className="form-control fw-bold"
                value={currentProduct.pvht || ""}
                disabled
                placeholder="Tarif"
                style={{
                  height: "52px",
                  borderRadius: "10px",
                  backgroundColor: "#E8F5E9",
                  border: "1px solid #A5D6A7",
                  color: "#2D8A4E",
                }}
              />
            </div>
            <button
              className="btn btn-success d-flex align-items-center px-4"
              onClick={handleAddProduct}
              style={{
                height: "52px",
                whiteSpace: "nowrap",
                fontSize: "0.95rem",
                fontWeight: "600",
                borderRadius: "10px",
              }}
            >
              <FaPlusCircle className="me-2" /> Ajouter
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-end gap-3 mb-3">
          <div style={{ flex: 1 }}>
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
          <div style={{ flex: 1 }}>
            <SelectDisplay
              label="Sous-famille de médicaments"
              optionname="une sous-famille"
              onChange={(value) =>
                setCurrentProduct({
                  ...currentProduct,
                  famille: String(value),
                })
              }
              selectedValue={currentProduct.famille || ""}
              options={sousFamillesOptions}
            />
          </div>
          <div style={{ width: "180px" }}>
            <label
              className="form-label d-flex align-items-center mb-2"
              style={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "0.95rem",
              }}
            >
              Qté à commander *
            </label>
            <input
              type="number"
              className="form-control fw-bold"
              value={currentProduct.qte_commander_l || ""}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  qte_commander_l: Number(e.target.value),
                })
              }
              placeholder="Quantité"
              min={1}
              style={{
                height: "52px",
                borderRadius: "10px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                color: "#856404",
              }}
            />
          </div>
          <button
            className="btn btn-success d-flex align-items-center px-4"
            onClick={handleAddProduct}
            style={{
              height: "52px",
              whiteSpace: "nowrap",
              fontSize: "0.95rem",
              fontWeight: "600",
            }}
          >
            <FaPlusCircle className="me-2" /> Ajouter un produit
          </button>
        </div>
      )}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <div className="overflow-x-auto rounded-lg">
            <table
              className="w-full bg-white"
              style={{
                width: "350%",
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
                    }}
                  >
                    Désignation, Forme et Dosage
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Code
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Unité
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité à commander
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "200px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Prix
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités disponibles en début du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités reçues au cours du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités distribuées aux clients au cours du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités perdues au cours du trimestre (pertes)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités transférées au cours du trimestre (ajustement)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités restantes en fin de trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité disponible utilisable
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    LOT
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Nombre de jours de rupture de stock
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    CMM (Réelle pour les PhaG Dis, Ajusté pour les hopitaux)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Stock Maximum
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité commandée (arrondie au conditionnement)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "350px",
                      fontWeight: "600",
                    }}
                  >
                    MSD
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "80px",
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {commande.lignecommandes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={18}
                      className="text-center py-4 text-muted bg-white"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="py-5">
                        <FaBox className="fs-1 mb-3 opacity-25" />
                        <div>Aucun produit ajouté</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commande.lignecommandes.map((prod, index) => (
                    <tr
                      key={prod.id}
                      style={{
                        backgroundColor: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: 600,
                          width: "400px",
                        }}
                      >
                        {prod.produit}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="light"
                          text="dark"
                          style={{ fontWeight: "normal" }}
                        >
                          {prod.code}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="secondary"
                          text="white"
                          style={{ fontWeight: "normal" }}
                        >
                          {prod.unite || "N/A"}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control fw-bold"
                          value={prod.qte_commander_l || 0}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_commander_l",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "6px",
                            color: "#856404",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {prod.pvht ? (
                          <span
                            style={{
                              backgroundColor: "#E8F5E9",
                              color: "#2D8A4E",
                              fontWeight: "700",
                              padding: "6px 14px",
                              borderRadius: "8px",
                              fontSize: "0.9rem",
                              display: "inline-block",
                            }}
                          >
                            {Number(prod.pvht).toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_debut}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_debut",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_recue}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_recue",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_distribuee}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_distribuee",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_perdue}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_perdue",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.ajustement}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "ajustement",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="info"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.qte_fin?.toLocaleString("fr-FR") || 0}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="primary"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.lignesLot
                            ?.reduce(
                              (sum: number, lot: { quantite?: number }) =>
                                sum + (lot.quantite || 0),
                              0,
                            )
                            .toLocaleString("fr-FR") || 0}
                        </Badge>
                      </td>
                      <td
                        style={{ padding: "12px", textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prod.lignesLot && prod.lignesLot.length > 0 ? (
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                handleShowLotDetails(
                                  prod.lignesLot,
                                  prod.produit || "Produit",
                                  index,
                                )
                              }
                              className="mb-2"
                            >
                              <FaClipboardList className="me-1" />
                              {prod.lignesLot.length} lot(s)
                            </Button>
                            <div>
                              {prod.lignesLot.length > 3 && (
                                <Badge bg="info" className="mb-1">
                                  +{prod.lignesLot.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              handleShowLotDetails(
                                [],
                                prod.produit || "Produit",
                                index,
                              )
                            }
                          >
                            <FaPlus className="me-1" />
                            Ajouter lots
                          </Button>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.nb_jour_rupture}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "nb_jour_rupture",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor:
                              prod.nb_jour_rupture > 0 ? "#ffeaea" : "#eaffea",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.cmm}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "cmm",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#e9ecef",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            color: "#495057",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.stock_max?.toFixed() || 0}
                          readOnly
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#e9ecef",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            cursor: "not-allowed",
                            color: "#495057",
                          }}
                        />
                      </td>

                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control fw-bold"
                          value={prod.qte_commandee || 0}
                          readOnly
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#d1e7dd",
                            border: "1px solid #198754",
                            borderRadius: "6px",
                            cursor: "not-allowed",
                            color: "#0f5132",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="warning"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.cmm > 0
                            ? (
                                prod.lignesLot?.reduce(
                                  (sum: number, lot: { quantite?: number }) =>
                                    sum + (lot.quantite || 0),
                                  0,
                                ) / prod.cmm
                              ).toFixed(2)
                            : "N/A"}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          position: "sticky",
                          right: 0,
                          backgroundColor: "white",
                          zIndex: 5,
                          boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeProduct(index)}
                          title="Supprimer ce produit"
                          style={{ borderRadius: "6px" }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>

        <Card.Footer className="bg-white border-0 p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Total des lignes:{" "}
              <strong>{commande.lignecommandes.length}</strong>
            </div>
          </div>
        </Card.Footer>
      </Card>

      <Modal
        show={showLotModal}
        onHide={handleCloseLotModal}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1FB05B", color: "white" }}
        >
          <Modal.Title>Gestion des lots - {selectedProductName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Button variant="success" size="sm" onClick={handleAddLot}>
              <FaPlus className="me-2" />
              Ajouter un lot
            </Button>
          </div>

          {selectedLots.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaBox className="fs-1 mb-3 opacity-25" />
              <div>Aucun lot ajouté</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th>N° Lot</th>
                    <th>Quantité</th>
                    <th>Date de péremption</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLots.map((lot, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={lot.lot}
                          onChange={(e) =>
                            handleUpdateLot(idx, "lot", e.target.value)
                          }
                          placeholder="N° lot"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={lot.quantite}
                          onChange={(e) =>
                            handleUpdateLot(
                              idx,
                              "quantite",
                              Number(e.target.value),
                            )
                          }
                          placeholder="Quantité"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          value={lot.date_peremption}
                          onChange={(e) =>
                            handleUpdateLot(
                              idx,
                              "date_peremption",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveLot(idx)}
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLotModal}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleSaveLotChanges}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

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
            <FaCheck className="me-2" /> Valider la commande enlèvement
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
            navigate("/orders_client?type=enlevement");
          }
        }}
        status={orderStatus}
        errorMessage={orderError}
        successMessage="Commande Enlèvement enregistrée et envoyée avec succès !"
        redirectPath="/orders_client?type=enlevement"
      />
    </div>
  );
};

export default CommandeEnlevement;
