import { useEffect, useState } from "react";
import { Carousel, Spinner } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import { useOutletContext, useParams } from "react-router-dom";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { getProduitsSimilairesPaginatedQuery, productQuery } from "../api/graphql/queries";
import { Product as Produit } from "../types/product.types";
import { BASE_URL, COUNT, PAGE } from "../utils/variable";
import CardProduct from "../components/product/Cardproduct";
import { useCrud } from "../hooks/useCrud";
import { Panier } from "../types/panier.types";
import { toast } from 'react-toastify';


const Product = () => {
    const { user } = useOutletContext<{ user: any; isAuthLoading: boolean }>();
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const productId = id ? parseInt(id) : 0;
    const { data: produit, isLoading, isError } = useCrudGraph<Produit>("produits").useFetchAll(productQuery(productId));
    const { data: produitsSimilaires = [], isLoading: isLoadingSimilaires, isError: isErrorSimilaires } = useCrudGraph<{ data: Produit[], metadata: { current_page: number, last_page: number, per_page: number, total: number } }>('produitsimilairespaginated').useFetchAll(getProduitsSimilairesPaginatedQuery(PAGE, COUNT));

    // Gestion de l'historique de vue
    const { useCreateItem } = useCrud<{ produit: number }>('/api/historique', 'historiques');
    const { mutate: addHistory } = useCreateItem();
    const { useCreateItem: useCreateItemPanier } = useCrud<Panier>('/api/panier', 'paniers');
    const { mutate: addPanier } = useCreateItemPanier();

    useEffect(() => {
        if (produit?.[0]) {
            addHistory({ produit: produit[0].id }, {
                onSuccess: () => {
                    toast.success("Produit ajouté à l'historique");
                },
                onError: () => {
                    toast.error("Erreur lors de l'ajout à l'historique");
                }
            });
        }
    }, [produit]);

    const handleAddPanier = () => {
        if (!produit?.[0] || !user?.id) return;

        setIsAddingToCart(true);
        const panierData = {
            produit: produit[0].id,
            user: user.id,
            quantite: quantity,
            action: 0
        };

        addPanier(panierData, {
            onSuccess: () => {
                setQuantity(1);
                setIsAddingToCart(false);
                toast.success("Produit ajouté au panier");
            },
            onError: () => {
                console.error("Erreur lors de l'ajout au panier");
                toast.error("Erreur lors de l'ajout au panier");
                setIsAddingToCart(false);
            }
        });
    };

    return (
        <div className="container my-5">
            {isLoading ? (
                <p>Chargement...</p>
            ) : isError ? (
                <p className="text-danger">Erreur lors du chargement du produit.</p>
            ) : produit?.[0] ? (
                <>
                    <div className="d-flex flex-column flex-md-row align-items-start w-100 justify-content-between gap-3">
                        {/* Carrousel d'images */}
                        <div className="product-carousel flex-grow-1">
                            <Carousel className="product-carousel-imgs" interval={3000} pause="hover" indicators controls>
                                {produit[0].image ? (
                                    <Carousel.Item>
                                        <img src={BASE_URL + produit[0].image} alt={produit[0].designation} className="w-100" />
                                    </Carousel.Item>
                                ) : (
                                    <Carousel.Item>
                                        <p>Aucune image disponible</p>
                                    </Carousel.Item>
                                )}
                            </Carousel>
                        </div>

                        {/* Détails du produit */}
                        <div className="product-details flex-grow-1">
                            <h2>{produit[0].designation}</h2>
                            <p className="product-price">{produit[0].prix} Ar</p>
                            <p className="product-description">{produit[0].description || "Pas de description disponible."}</p>

                            {/* Sélection de la quantité */}
                            <div className="quantity-container">
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                    className="form-control w-50"
                                />
                            </div>

                            {/* Bouton Ajouter au panier */}
                            <div className="product-actions mt-3">
                                <button
                                    className="btn-button d-flex align-items-center gap-2"
                                    onClick={handleAddPanier}
                                    disabled={isAddingToCart}
                                >
                                    {isAddingToCart ? <Spinner animation="border" size="sm" /> : <FaShoppingCart />}
                                    {isAddingToCart ? "Ajout au panier..." : "Ajouter au panier"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>Aucun produit trouvé.</p>
            )}

            {/* Section des produits similaires */}
            <div className="my-5 rounded bg-theme-sombre px-4 pb-3">
                {/* <Title textColorSpan="text-white" textColorH2="text-white">Produits similaires</Title> */}

                {isLoadingSimilaires ? (
                    <p>Chargement...</p>
                ) : isErrorSimilaires ? (
                    <p className="text-danger">Erreur lors du chargement des produits similaires.</p>
                ) : produitsSimilaires.length > 0 ? (
                    <div className="row ">
                        {produitsSimilaires[0]?.data?.map((produit) => (
                            <div key={produit.id} className="col-6 col-sm-4 col-md-3 col-lg-3 g-3"> {/* Padding entre éléments */}
                                <CardProduct product={produit} className="h-100 card-product-small" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Aucun produit similaire disponible.</p>
                )}
            </div>
        </div>

    );
};

export default Product;
