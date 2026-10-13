import FeatureCard from "./FeatureCard";

import image2 from "../assets/images/image1.png";
import image3 from "../assets/images/image2.png";
import image4 from "../assets/images/image3.png";

const FeaturesSection: React.FC = () => {
    return (
        <div className="container bg-white rounded-4 p-4"
        style={{ border: "2px solid #1FB05B" }}
        >
            <div className="row">
                <FeatureCard
                    title="Centralisation"
                    description="Fourniture de médicaments et équipements médicaux abordables aux acteurs de santé à Madagascar."
                    image={image2}
                    withRightBorder 
                />
                <FeatureCard
                    title="Transparence"
                    description="Faciliter l’accès physique et financier aux médicaments essentiels de qualité pour toute la population malgache."
                    image={image3}
                    withRightBorder
                />
                <FeatureCard
                    title="Performance"
                    description="Acteur clé du système de santé, pour un accès renforcé aux médicaments de qualité en faveur de la population malgache."
                    image={image4}
                />
            </div>
        </div>
    );
};

export default FeaturesSection;

