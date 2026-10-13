import approvisionnement from "../assets/images/sedima/icone_satisfaction.png";
import distribution from "../assets/images/sedima/icone_livraison.png";
import shipchandling from "../assets/images/sedima/icone_produit_proximite.png";
import { Row, Col } from 'react-bootstrap';

const Features = () => {
    const features = [
        {
            icon: approvisionnement,
            title: "Approvisionnement",
            description: "de marchandises dans vos destinations choisis"
        },
        {
            icon: distribution,
            title: "Distribution",
            description: "de vos produits dans toute la région ou zones choisies"
        },
        {
            icon: shipchandling,
            title: "Shipchandling",
            description: "Avitaillement et ventes de fournitures logistiques"
        }
    ];

    return (
        <>
            <Row className="g-4">
                {features.map((feature, index) => (
                    <Col key={index} xs={12} md={4}>
                        <div className="h-100 p-2 bg-theme-sombre rounded-4 d-flex justify-content-between">
                            {/* Block texte - gauche */}
                            <div className=" d-flex flex-column justify-content-center py-4" style={{ width: '65%' }}>
                                <p className=" fw-bold text-white mb-0">{feature.title}</p>
                                <p className="mb-0 text-light">{feature.description}</p>
                            </div>

                            {/* Block image - droite */}
                            <div className="d-flex align-items-center" style={{ width: '35%' }}>
                                <img
                                    src={feature.icon}
                                    alt={feature.title}
                                    className="img-fluid"
                                    style={{
                                        minWidth: '100px',
                                        maxHeight: '120px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default Features;