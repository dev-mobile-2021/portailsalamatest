import { useState, useEffect } from "react";
import { getCampagnesPaginatedQuery } from "../api/graphql/queries";
// import Header from "../components/const/Header";
import Title from "../components/const/Title";
import FeaturesSection from "../components/FeaturesSection";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Campagne } from "../types/Campagne.types";
import CampaignList from "./CampaignList";
import TenderList from "./TenderList";
import TransportOfferList from "./TransportOfferList";
import { COUNT, PAGE } from "../utils/variable";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import { useAOContext } from "../context/AOContext";
import SmallHeader from "../components/const/SmallHeader";

// import { AOProvider } from "../context/AOContext";
import { useFiltreSubmissionContext } from "../context/FiltreSubmissionContext";
import { useOffresTransport } from "../hooks/useOffresTransport";
import SkeletonCardList from "../components/SkeletonCardList";

const HomePage = () => {
  const { user, fournisseur } = useAuthContext();
  const navigate = useNavigate();
  const [page] = useState(PAGE);
  const [count] = useState(COUNT);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [typeMarches, setTypeMarches] = useState<Array<{id: string, designation: string, description: string}>>([]);
  const { filtreSubmission, setFiltreSubmission } = useFiltreSubmissionContext();

  // Vérifier si le fournisseur est un transporteur
  const isTransporteur = fournisseur?.TSSCOD_0_0 === "TRANS";
  console.log("voici le fournisseur", fournisseur);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    fetch("https://backsignup.h-tsoft.com//graphql?query={typemarches{id,designation,description}}")
      .then(res => res.json())
      .then(data => {
        if (data?.data?.typemarches) {
          setTypeMarches(data.data.typemarches);
        }
      });
  }, []);
  

  const { data: campagnes } = useCrudGraph<{
    data: Campagne[];
    metadata: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>("campagnespaginated").useFetchAll(
    getCampagnesPaginatedQuery(page, count, user?.client_id || 0),
    {},
    { enabled: true }
  );
  console.log(user?.client_id)

    const { aos, loading: loadingAO } = useAOContext();
    const { offresTransport, loading: loadingTransport } = useOffresTransport();

    // État pour le délai minimum d'affichage du skeleton (1.5 secondes)
    const [minDelayPassed, setMinDelayPassed] = useState(false);

    useEffect(() => {
      // Afficher le skeleton pendant au moins 1.5 secondes
      const timer = setTimeout(() => {
        setMinDelayPassed(true);
      }, 1500);

      return () => clearTimeout(timer);
    }, []);

    // État de chargement global - on attend que les données soient chargées ET que le délai minimum soit passé
    const dataLoading = isTransporteur ? loadingTransport : loadingAO;
    const isLoading = dataLoading || !minDelayPassed;


  const handleViewCampagne = (campagneId: number) => {
    if (!user) {
      alert("Veuillez vous connecter pour consulter cette campagne.");
      return;
    }
    // navigate(`/commande/campagne/${campagneId}`);
    navigate(`/commande/formulaire/${campagneId}`);
    // navigate(`/commande/formulaire`);
  };

    return (
       
        <>
          <SmallHeader />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="bg-transparent container-fluid m-0 p-0">
              <div className="container py-5">
              {/* fournisseur */}
              {user?.fournisseur_id && (
                <>
                <Title
                  spanText="Liste complète"
                  titleText={isTransporteur ? "Offres de Transport" : "Appels d'offres"}
                  textColorH2="text-theme-claire"
                  align="left"
                  maxWidth="800px"
                >
                  {!isTransporteur && (
                    <>
                      <button
                        className={`${selectedType === "ALL" ? "btn-button" : "btn-wishlist"} text-white px-2 py-1 ${selectedType === "ALL" ? "opacity-100" : "opacity-50"}`}
                        style={{ fontSize: "13px", minWidth: "80px" }}
                        onClick={() => setSelectedType("ALL")}
                      >
                        Tous
                      </button>
                      {typeMarches.map((type) => (
                        <button
                          key={type.id}
                          className={`${selectedType === type.id ? "btn-button" : "btn-wishlist"} text-white px-2 py-1 ${selectedType === type.id ? "opacity-100" : "opacity-50"}`}
                          style={{ fontSize: "13px", minWidth: "80px" }}
                          onClick={() => setSelectedType(type.id)}
                        >
                          {type.designation}
                        </button>
                      ))}
                    </>
                  )}
                </Title>
                
                {/* Afficher le switch uniquement pour les AO classiques */}
                {!isTransporteur && (
                  <div className="d-flex align-items-center justify-content-end mb-3 px-3">
                    <div className="form-switch d-flex align-items-center gap-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchSubmission"
                        checked={filtreSubmission === 1}
                        onChange={() => setFiltreSubmission(filtreSubmission === null ? 1 : null)}
                        style={{
                          cursor: "pointer",
                          width: "40px",
                          height: "22px",
                          boxShadow: "0 0 0 2px #1FB05B33"
                        }}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="switchSubmission"
                        style={{ cursor: "pointer", fontSize: "14px", marginRight: "10px" }}
                      >
                        {"Appels d'offres soumis"}
                      </label>
                    </div>
                  </div>
                )}

                {/* Affichage conditionnel : Offres Transport ou AO classiques */}
                {isLoading ? (
                  <SkeletonCardList count={8} />
                ) : isTransporteur ? (
                  <TransportOfferList
                    offres={offresTransport}
                    loading={false}
                  />
                ) : (
                  <TenderList
                    selectedType={selectedType}
                    aos={aos}
                  />
                )}
                
                {/* <PaginationComponent
                  currentPage={1}
                  totalPages={5}
                  onPageChange={(page) => console.log(`Page changed to: ${page}`)}
                  perPage={10}
                  onPerPageChange={(perPage) =>
                    console.log(`Per page changed to: ${perPage}`)
                  }
                /> */}
                </>
                )}

                {/* ventes */}
            {(user?.client_id || user?.role?.isadmin === 1|| user?.fournisseur_id === null) && (
              <>
              <Title
                  spanText="Liste complète"
                  titleText={`Planning cyclique (${(campagnes && campagnes[0]?.data.length) || 0})`}
                  textColorH2="text-theme-claire"
                  align="left"
                  maxWidth="800px"
                />
                <CampaignList
                  campagnes={(campagnes && campagnes[0]?.data) || []}
                  onViewCampagne={handleViewCampagne}
                />
             
                </>
)}
                  {/*section commment ca marche   */}
                {/* <Title
                  spanText="Comment ça marche"
                  titleText="Campagnes, achats et appels d’offres...
                                en un seul lieu : le Portail SALAMA."
                  textColorH2="text-theme-claire"
                  align="left"
                  maxWidth="800px"
                >
                  <button className=" btn-button text-white px-3  py-2">
                    Demander une accréditation
                  </button>
                </Title> */}

                <div className="mb-5">
                  <FeaturesSection />
                </div>
              </div>
            </div>
          </div>
        </>
  
    );
};

export default HomePage;
