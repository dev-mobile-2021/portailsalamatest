import React from "react";
import pdf_icon from "../assets/images/pdf.png";
import { BASE_URL } from "../utils/variable";

interface CampaignCardProps {
    image: string;
    publishedDate: string;
    deadline: string;
    status: string;
    description: string;
    campaignName?: string; // Ajout optionnel du nom de campagne
    campaignId?: number; // ID de la campagne pour la logique d'image
}

// Fonction pour obtenir une image selon l'ID de la campagne
const getImageForCampaign = (campaignId: number, providedImage?: string) => {
    // Si une image est fournie, l'utiliser en priorité
    if (providedImage !== "/assets/images/upload.jpg") {
        return BASE_URL + providedImage;
    }

    // Images par défaut basées sur ID pair/impair
    const isEven = campaignId % 2 === 0;
    return isEven 
        ? "https://salama.mg/web/image/1031/_MG_2207.JPG"
        : "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
}

const CampaignCard: React.FC<CampaignCardProps> = ({
    image,
    publishedDate,
    deadline,
    status,
    description,
    campaignName = "Nom du planning",
    campaignId = 0
}) => {
    // Fonction pour formater le statut avec la couleur appropriée
    const getStatusStyle = (status: string) => {
        if (status === 'en cours') {
            return { color: '#28a745' }; // Vert pour "en cours"
        }
        return { color: '#6c757d' }; // Gris par défaut
    };

    // Obtenir l'URL finale de l'image
    const finalImageUrl = getImageForCampaign(campaignId, image);

    return (
        <div className="border-bottom py-4" style={{ borderBottom: '1px solid #e9ecef' }}>
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex" style={{ flex: 1 }}>
                    {/* Image de la campagne */}
                    <div style={{ marginRight: '20px', flexShrink: 0 }}>
                        <img
                            src={finalImageUrl}
                            alt="Planning"
                            style={{ 
                                width: '120px', 
                                height: '90px', 
                                borderRadius: '8px', 
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                    
                    {/* Contenu textuel */}
                    <div style={{ flex: 1 }}>
                        {/* Ligne des métadonnées */}
                        <div className="mb-2">
                            <small style={{ color: '#6c757d', fontSize: '14px' }}>
                                <span>Publié le {publishedDate}</span>
                                <span className="mx-2">•</span>
                                <span>{campaignName}</span>
                                <span className="mx-1">/</span>
                                <span style={{ color: '#dc3545' }}>Date limite : le {deadline}</span>
                                <span className="mx-1">/</span>
                                <span>Statut : </span>
                                <span style={getStatusStyle(status)}>{status}</span>
                            </small>
                        </div>
                        
                        {/* Description */}
                        <p 
                            className="mb-0" 
                            style={{ 
                                color: '#495057', 
                                fontSize: '16px',
                                lineHeight: '1.5',
                                fontWeight: '400'
                            }}
                        >
                            {description}
                        </p>
                    </div>
                </div>
                
                {/* Icône PDF */}
                <div style={{ marginLeft: '15px', flexShrink: 0 }}>
                    <img 
                        src={pdf_icon} 
                        alt="PDF Icon" 
                        style={{ 
                            width: '20px', 
                            height: '20px',
                            cursor: 'pointer',
                            opacity: 0.7
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;