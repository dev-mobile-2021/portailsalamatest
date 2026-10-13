import React from "react";
import CampaignCard from "../components/CampaignCard";
import { Campagne } from "../types/Campagne.types";

interface CampaignListProps {
    campagnes: Campagne[];
    onViewCampagne: (id: number) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campagnes, onViewCampagne }) => {
    if (!campagnes.length) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Aucun planning cyclique disponible.</p>
            </div>
        );
    }

    return (
        <div className="container bg-white rounded-3 p-3">
            {campagnes.map((campagne) => (
                <div
                    key={campagne.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => onViewCampagne(campagne.id)}
                >
                    <CampaignCard
                        image={campagne.image}
                        campaignId={campagne.id}
                        publishedDate={new Date(campagne.date).toLocaleDateString()}
                        deadline={"--"}
                        status={campagne.statut}
                        description={campagne.designation}
                    />
                </div>
            ))}
        </div>
    );
};

export default CampaignList;
