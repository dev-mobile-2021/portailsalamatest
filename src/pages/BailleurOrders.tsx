import { Container, Row, Col, Badge } from "react-bootstrap";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Order, OrdersPaginatedResponse } from "../types/order.types";
import { getcommandespaginatedsQuery } from "../api/graphql/queries";
import { COUNT, PAGE } from "../utils/variable";
import Spiner from "../components/const/Spiner";
import dossier_icon from "../assets/images/dossier.png";
import dossier_icon_small from "../assets/images/dossier_icon_small.png";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useUserhook";

const BailleurOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();

    // On empêche les hooks d’être appelés tant que `user` n’est pas prêt
    if (!user) {
        return <Spiner />;
    }

    // Appelle le hook uniquement quand `user` est dispo
    const { data: commandes = [], isLoading: isLoadingcommandes } =
        useCrudGraph<OrdersPaginatedResponse>('commandespaginated').useFetchAll(
            getcommandespaginatedsQuery(PAGE, COUNT, null, user.profilable_id),
            {},
            {}
        );



    if (isLoadingcommandes) {
        return <Spiner />;
    }


    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const handleOrderClick = (order: Order) => {
        navigate(`/detail_orders_client/${order.id}`);
    };

    return (
        <Container className="py-4">
            {/* Header with title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <img
                        src={dossier_icon_small}
                        className="icon-size me-3"
                        alt="Orders icon"
                        style={{ width: '20px' }}
                    />
                    <p className="m-0">Dossiers des clients</p>
                </div>
            </div>
            <hr />

            {/* Orders grid */}
            <Row className="bg-transparent rounded-0 shadow-none">
                {(commandes.length > 0 && commandes[0]?.data?.length > 0) ? (
                    commandes[0].data.map((order: Order) => (
                        <Col key={order.id} md={3} sm={6} className="mb-4" onClick={() => handleOrderClick(order)}>
                            <div className="folder-icon">
                                <div className="folder-image d-flex justify-content-center">
                                    <img src={dossier_icon} alt="Folder" style={{ width: '100px' }} />
                                </div>
                                <div className="folder-label mt-1">
                                    <strong className="text-white rounded-4 p-0 m-0 bg-success d-flex align-items-center gap-1 justify-content-between">
                                        <span className="mx-4 text-white">
                                            {order.client ? order.client.designation : '---'}
                                        </span>
                                        <Badge className={order.etat_badge}>{order.etat_text}</Badge>
                                    </strong>
                                    <span className="mb-0 text-dark" style={{ fontSize: '0.6rem' }}>
                                        <b> Date</b>: {formatDate(order.datecommande)}
                                    </span> -
                                    <span className="mb-0 text-dark" style={{ fontSize: '0.6rem' }}>
                                        <b> Livraison</b>: {formatDate(order.datereception)}
                                    </span> -
                                    <span className="mb-0" style={{ fontSize: '0.6rem' }}>
                                        <b> Article(s)</b>: {order.detailcommandes?.length || 0}
                                    </span> -
                                    <span className="mb-0 text-dark" style={{ fontSize: '0.6rem' }}>
                                        <b> Type Livraison</b>: {order.typelivraison ? order.typelivraison.designation : '---'}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    ))
                ) : (
                    <p className="text-center">Aucune commande trouvée.</p>
                )}

            </Row>



            <style>
                {`
                .folder-icon {
                    cursor: pointer;
                    padding: 15px 10px;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    background-color: #f9fafb;
                    border: 1px solid #56c224;
                    height: 100%;
                    display: block;
                }

                .folder-icon:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
                    background-color: #f0fdf4;
                    border-color: #16a34a;
                }

                a:hover {
                    text-decoration: none !important;
                }

                .folder-image {
                    transition: transform 0.3s ease;
                }

                .folder-icon:hover .folder-image {
                    transform: scale(1.05);
                }

                .folder-label {
                    text-align: center;
                    margin-top: 10px;
                }

                .folder-label strong {
                    font-size: 1rem;
                    display: block;
                }

                .badge {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 12px;
                }

                @media (max-width: 768px) {
                    .col-md-4 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                }

                @media (max-width: 480px) {
                    .col-md-4 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }
                }
                `}
            </style>
        </Container>
    );
};

export default BailleurOrders;