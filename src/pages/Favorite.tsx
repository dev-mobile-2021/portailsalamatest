import { getproduitfavoriespaginatedsQuery } from "../api/graphql/queries";
import ProductList from "../components/product/ProductList";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { COUNT, PAGE } from "../utils/variable";
import { Favorie } from "../types/favorie.type";
import { useOutletContext } from "react-router-dom";
import { User } from "../types/user.types";
import Spiner from "../components/const/Spiner";
import { Alert } from "react-bootstrap";

const Favorite = () => {
    const { user } = useOutletContext<{ user: User }>();
    const { data: favories = [], isLoading, isError } = useCrudGraph<{ data: Favorie[], metadata: { current_page: number, last_page: number, per_page: number, total: number } }>('favoriespaginated').useFetchAll(
        getproduitfavoriespaginatedsQuery(PAGE, COUNT, user?.id || 0),
        {},
        {
            enabled: !!user?.id,
        }
    );



    return (
        <div className="container my-5 m-0 p-0">
            {
                isLoading ? <Spiner /> :
                    isError ? <Alert variant="danger">Erreur lors de la récupération des favoris</Alert> :
                        <ProductList products={favories[0]?.data?.map((favory) => favory.produit) || []} />
            }
        </div>
    );
};

export default Favorite;