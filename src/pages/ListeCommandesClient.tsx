import { Container, Row, Col, Badge } from "react-bootstrap";
import dossier_icon from "../assets/images/dossier.png";
import dossier_icon_small from "../assets/images/dossier_icon_small.png";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";


const badgeColors: { [key: string]: string } = {
    Rc_IMP: 'info',
    Rp_IMP: 'secondary',
    Rp_sans_IMP: 'warning',
    TEF: 'danger',
};


export const commandes = [
    {
        id: 1,
        type: 'Rc_IMP',
        date: '2025-08-01',
        articles: [
            { designation: 'Paracétamol 500mg', quantite: 10, codePromo: 'PROMO10' },
            { designation: 'Sirop contre la toux', quantite: 5, codePromo: 'PROMO5' },
        ]
    },
    {
        id: 2,
        type: 'Rp_IMP',
        date: '2025-08-02',
        articles: [
            { designation: 'Gants médicaux stériles', quantite: 2 },
            { designation: 'Thermomètre digital', quantite: 1 },
        ]
    },
    {
        id: 3,
        type: 'Rp_sans_IMP',
        date: '2025-08-03',
        articles: [
            { designation: 'Crème antiseptique', quantite: 20, codePromo: 'MED20' },
        ]
    },
    {
        id: 4,
        type: 'TEF',
        date: '2025-08-03',
        articles: [
            { designation: 'Crème antiseptique', quantite: 20, codePromo: 'MED20' },
        ]
    }
];


const ListeCommandesSimulees = () => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR");
    };
    const navigate = useNavigate();

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <img src={dossier_icon_small} className="icon-size me-3" alt="icon" style={{ width: '20px' }} />
                    <p className="m-0">📁 Commandes  du client</p>
                </div>
            </div>
            <hr />
            <div className="d-flex flex-column align-items-start ">
                <NavLink to="/commandeRcSansimpotForm" className="btn  text-black rounded-3 px-4  fw-bold">
                    passer une commande de type(promos / sans promos)
                </NavLink>
                <NavLink to="/commandeRcSansimpotForm" className="btn  text-black rounded-3 px-4  fw-bold">
                    passer une commande simple
                </NavLink>
            </div>

            <Row>

                {commandes.map((order) => (
                    <Col key={order.id} md={4} sm={6} className="mb-4" onClick={() => navigate(`/detail_commande/${order.id}`)}>
                        <div className="folder-icon">
                            <div className="folder-image d-flex justify-content-center">
                                <img src={dossier_icon} alt="Folder" style={{ width: '100px' }} />
                            </div>
                            <div className="folder-label mt-2">
                                <strong className="text-white rounded-4 p-0 m-0 bg-success d-flex align-items-center gap-1 justify-content-between">
                                    <span className="mx-4 text-white">
                                        Commande #{order.id}
                                    </span>
                                    <Badge bg={badgeColors[order.type] || 'dark'} style={{ padding: '0.2rem', margin: "0.4rem" }}>
                                        {order.type}
                                    </Badge>
                                </strong>
                                <div className="mt-2 text-dark" style={{ fontSize: '0.75rem' }}>
                                    <div><b>Date :</b> {formatDate(order.date)}</div>
                                    <div><b>Articles :</b> {order.articles.length}</div>
                                    <div className="mt-2">
                                        {order.articles.map((article, idx) => (
                                            <div key={idx} className="text-muted">
                                                • {article.designation} ({article.quantite})
                                                {'codePromo' in article && article.codePromo && (
                                                    <> – <span className="text-primary fw-bold">{article.codePromo}</span></>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <style>{`
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

                .folder-image {
                    transition: transform 0.3s ease;
                }

                .folder-icon:hover .folder-image {
                    transform: scale(1.05);
                }

                .folder-label {
                    text-align: center;
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
            `}</style>
        </Container>
    );
};

export default ListeCommandesSimulees;
