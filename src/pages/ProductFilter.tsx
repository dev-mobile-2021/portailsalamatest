import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { getProductsPaginatedQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Product } from "../types/product.types";
import { useEffect, useState } from "react";
import { PAGE, COUNT } from "../utils/variable";
import ProductList from "../components/product/ProductList";
import { Alert } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import Spiner from "../components/const/Spiner";

const ProductFilter = () => {
    const { id } = useParams(); // Récupérer l'ID de la catégorie ou du filtre
    const { user, isAuthLoading } = useOutletContext<{ user: any; isAuthLoading: boolean }>();
    const navigate = useNavigate(); // Pour gérer la navigation

    const [page] = useState(PAGE); // État pour la page actuelle
    const [count] = useState(COUNT);

    // Gestion du changement de page
    // const handlePageChange = (newPage: number) => {
    //     setPage(newPage);
    //     refetch();
    // };

    // Requête pour les produits paginés
    const { data: products, isLoading: isProductsLoading, isError: isProductsError, refetch } = useCrudGraph<{ data: Product[], metadata: { current_page: number, last_page: number, per_page: number, total: number } }>('produitspaginated').useFetchAll(
        getProductsPaginatedQuery(page, count, user?.id, id ? parseInt(id) : undefined),
        {},
        { enabled: !isAuthLoading }
    );

    // Recharger les produits lorsque l'ID change
    useEffect(() => {
        refetch();
    }, [id]);

    // Gérer le retour à la page précédente
    const handleGoBack = () => {
        navigate(-1); // Retour à la page précédente
    };

    // Affichage pendant le chargement
    if (isProductsLoading) {
        return (
            <Spiner />
        );
    }

    // Affichage en cas d'erreur
    if (isProductsError) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Alert variant="danger" className="text-center">
                    Une erreur s'est produite lors du chargement des produits.
                </Alert>
            </div>
        );
    }

    return (
        <div className="container my-3">
            {/* Bouton Retour */}
            <button

                onClick={handleGoBack}
                className="mb-5 py-2  d-flex btn-wishlist  align-items-center gap-2"
            >
                <FaArrowLeft />
            </button>



            {/* Pagination en haut */}
            {/* <PaginationComponent
                currentPage={page}
                totalPages={Math.ceil((products?.[0]?.metadata?.total || 0) / count)}
                onPageChange={handlePageChange}
            /> */}

            {/* Liste des produits */}
            <ProductList products={products?.[0]?.data || []} />

            {/* Pagination en bas */}
            {/* <PaginationComponent
                currentPage={page}
                totalPages={Math.ceil((products?.[0]?.metadata?.total || 0) / count)}
                onPageChange={handlePageChange}
            /> */}
        </div>
    );
};

export default ProductFilter;