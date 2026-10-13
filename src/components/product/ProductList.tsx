import CardProduct from './Cardproduct';
import { Product } from '../../types/product.types';

const ProductList = ({ products }: { products: Product[] }) => {
    return (
        <div className="container-fluid px-0 ">
            <div className="row "> 
                {products?.map((product) => (
                    <div key={product.id} className="col-6 col-sm-4 col-md-3 col-lg-3 g-3"> 
                        <CardProduct product={product} className="h-100"  />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;