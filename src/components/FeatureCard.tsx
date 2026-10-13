interface FeatureCardProps {
    title: string;
    description: string;
    image?: string;
    withRightBorder?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, image, withRightBorder = false }) => {
    return (
        <div
            className={`col-md-4 d-flex flex-column align-items-start text-start p-2 ${withRightBorder ? "border-end border-2 border-right" : ""
                }`}
        >
            <div className="mb-4 d-flex align-items-center justify-content-start" style={{ minHeight: '80px' }}>
                {image && (
                    <img
                        src={image}
                        alt=""
                        style={{ width: '60px', height: 'auto', objectFit: 'contain' }}
                    />
                )}
            </div>

            <div className="mb-2 w-100">
                <h5 className="text-success fw-bold mb-3 d-flex align-items-center">{title}</h5>
            </div>
            <p className="text-muted">{description}</p>
        </div>
    );
};
export default FeatureCard;