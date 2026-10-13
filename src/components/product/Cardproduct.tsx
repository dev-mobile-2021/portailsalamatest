import { memo } from "react";
import { NavLink } from "react-router-dom";
import { Product } from "../../types/product.types";
import { BASE_URL } from "../../utils/variable";


const CardProduct = memo(({ product, className }: { product: Product; className?: string }) => {


    return (
        <>
            <div className={`card-product ${className ?? ''}`} key={product.id}>
                <div className="section-img">
                    <NavLink to={`/product/${product.id}`}>
                        <img src={BASE_URL + product.image} className="" alt={product.designation} />
                    </NavLink>
                </div>
                <div className="card-info p-0 m-0 py-2">
                    <p className="p-0 m-0 px-2 text-dark fw-bold text-truncate ">{product.designation}</p>
                </div>
                <div className="card-footer m-0 p-2">
                    <p className="p-0 m-0">
                        <span className="p-0 m-0 fw-bold">{product.prix} Ar</span>
                    </p>
                </div>
            </div>
        </>
    );
});

export default CardProduct;















