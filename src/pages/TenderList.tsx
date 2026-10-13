import TenderCard from "../components/TenderCarde";

import { AO } from "../types/AO.types";

interface TenderListProps {
  selectedType: string;
  aos?: AO[];
  // onViewAO: (AOId: number) => void;
}


const TenderList: React.FC<TenderListProps> = ({ selectedType, aos }) => {
  // Utilise les AO dynamiques si fournis, sinon tableau vide
  
  

  const tenders = aos || [];


  const filteredTenders = tenders.filter(
    (tender) =>
      (selectedType === "ALL" || tender.typemarche_id === selectedType) 
  );
//todo : ajouter l attribut datecloture
  return (
    <div className="container bg-white rounded-3 p-4">
      {filteredTenders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          Aucun appel d'offres ne correspond à votre sélection.
        </div>
      ) : (
        <div className="row g-4">
          {filteredTenders.map((tender) => (
            <div key={tender.id} className="col-lg-3 col-md-6 col-sm-12">
              <TenderCard
                id={Number(tender.id)}
                titre={tender.designation || ""}
                publishedDate={tender.datepublication || ""}
                reference={tender.reference || ""}
                deadline={tender.datecloture || ""}
                description={tender.etat_text || ""}
                typeCampagne={tender.typeprocedure?.designation || ""}
                TSSCOD={tender.TSSCOD_0_0 || ""}
                status={tender.targetpricestatus || ""}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenderList;