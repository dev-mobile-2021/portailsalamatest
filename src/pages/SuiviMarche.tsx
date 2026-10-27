import { useState, useEffect } from "react";
import SmallHeader from "../components/const/SmallHeader";
import Title from "../components/const/Title";
import PaginationComponent from "../components/PaginationComponent";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import SoumissionList from "./SoumissionList";

const SuiviMarche = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [soumissions, setSoumissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [typeMarches, setTypeMarches] = useState<Array<{id: string, designation: string, description: string}>>([]);

  useEffect(() => {
    if (!user || !user.fournisseur_id) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Récupérer les types de marchés
  useEffect(() => {
    fetch("https://backsignup.h-tsoft.com/graphql?query={typemarches{id,designation,description}}")
      .then(res => res.json())
      .then(data => {
        if (data?.data?.typemarches) {
          setTypeMarches(data.data.typemarches);
        }
      });
  }, []);

  // Récupérer les soumissions de l'utilisateur
  useEffect(() => {
    if (user?.fournisseur_id) {
      setLoading(true);
      fetch(
        `https://backsignup.h-tsoft.com/graphql?query={soumissions(fournisseur_id:${user.fournisseur_id}){id,date,ao_id,ao{id,reference,datecloture,datepublication,targetpricestatus,typemarche{id,designation},aoarticles{id,article{id,designation}}}}}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.soumissions) {
            console.log("📊 [SuiviMarche] Soumissions récupérées:", data.data.soumissions);
            setSoumissions(data.data.soumissions);
          }
        })
        .catch((error) => {
          console.error("❌ [SuiviMarche] Erreur lors du chargement des soumissions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.fournisseur_id]);

  // Filtrer par type, dédoublonner par ao_id (garder la plus récente) et trier par date de soumission
  const filteredSoumissions = (() => {
    const filtered = selectedType === "ALL" 
      ? soumissions 
      : soumissions.filter(s => s.ao?.typemarche?.id === selectedType);
    
    // Garder uniquement la soumission la plus récente par ao_id
    const uniqueByAo = filtered.reduce((acc, curr) => {
      const existingIndex = acc.findIndex((s: any) => s.ao_id === curr.ao_id);
      if (existingIndex === -1) {
        acc.push(curr);
      } else {
        // Garder la plus récente
        const existingDate = new Date(acc[existingIndex].date).getTime();
        const currDate = new Date(curr.date).getTime();
        if (currDate > existingDate) {
          acc[existingIndex] = curr;
        }
      }
      return acc;
    }, [] as any[]);

    // Trier par date de soumission (plus récent en premier)
    return uniqueByAo.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  })();

  const handleViewSoumission = (aoId: number) => {
    navigate(`/tableauSuivi/${aoId}`);
  };

  return (
    <>
      <SmallHeader />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="bg-transparent container-fluid m-0 p-0">
          <div className="container py-5">
            {user?.fournisseur_id && (
              <>
                <Title
                  spanText="Suivi de vos soumissions"
                  titleText={`Mes appels d'offres (${filteredSoumissions.length})`}
                  textColorH2="text-theme-claire"
                  align="left"
                  maxWidth="800px"
                >
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
                </Title>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <SoumissionList
                      soumissions={filteredSoumissions}
                      onViewSoumission={handleViewSoumission}
                    />
                    <PaginationComponent
                      currentPage={1}
                      totalPages={Math.ceil(filteredSoumissions.length / 10)}
                      onPageChange={(page) => console.log(`Page changed to: ${page}`)}
                      perPage={10}
                      onPerPageChange={(perPage) =>
                        console.log(`Per page changed to: ${perPage}`)
                      }
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuiviMarche;
