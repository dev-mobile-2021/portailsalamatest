import { memo } from "react";
import { ListGroup, Offcanvas } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { User } from "../types/user.types";
import { BASE_URL } from "../utils/variable";
import { usePanier } from "../hooks/usePanier";

interface IEndoffcanvasProps {
    showCart: boolean;
    handleClose: () => void;
    userconnect: User;
}

const Endoffcanvas = ({ showCart, userconnect, handleClose }: IEndoffcanvasProps) => {
    const { totalPrice, handleQuantityChange, handleRemoveProduct, cartItems } = usePanier(userconnect);
    const navigate = useNavigate();

    const handleCheckout = () => {
        handleClose();
        navigate("/cart");
    };

    return (
        <Offcanvas show={showCart} onHide={handleClose} placement="end" className=" py-4">
            <Offcanvas.Header closeButton className="bg-white m-1">
                <Offcanvas.Title className="text-dark w-100">🛒 Mon Panier</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {cartItems?.length > 0 ? (
                    <ListGroup variant="flush">
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item.produit.id} className="d-flex align-items-center">
                                <img
                                    src={`${BASE_URL}${item.produit.image}`}
                                    alt={item.produit.description}
                                    style={{ width: "100px", height: "100px" }}
                                    className="me-3"
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.produit.description}</h6>
                                    <p className="mb-0">Prix: {item.prix} Ar</p>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <input
                                            type="number"
                                            value={item.quantite} // ✅ La valeur est bien liée à l'état
                                            onChange={(e) => {
                                                const newQuantity = parseInt(e.target.value);
                                                console.log("onChange", newQuantity); // Debug
                                                if (!isNaN(newQuantity)) {
                                                    handleQuantityChange(item.produit_id, newQuantity);
                                                }
                                            }}
                                            className="rounded text-center w-75 py-1"
                                            min="1"
                                        />
                                        <FaTrashAlt
                                            className="text-danger ms-3"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleRemoveProduct(item)}
                                        />
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-center">Votre panier est vide.</p>
                )}

                {cartItems?.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-end">Total : {totalPrice} Ar</h5>
                        <button onClick={handleCheckout} className="w-100 mt-3 btn-button text-center">
                            Passer la commande
                        </button>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default memo(Endoffcanvas);