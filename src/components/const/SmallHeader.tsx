import { memo, useState, useEffect, useRef } from "react";
import salama_logo from "../../assets/images/salaman_logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import Title from "./Title";
import { useAuthContext } from "../../hooks/useUserhook";
import { FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import NotificationBell from "../notifications/NotificationBell";
// import Carrousel from "../Carroussel";
import eclipse from "../../assets/images/eclipse.png";
import SmallCarrousel from "../SmallCarroussel";
const SmallHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const { user,fournisseur, logout } = useAuthContext();
  const navigate = useNavigate(); 
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-white position-relative ">
        <div className="position-relative container-fluid  mb-4">
          <SmallCarrousel />

          {/* Eclipse positionnée en bas du carrousel */}
          <div
            className="position-absolute z-1 bottom-0 start-0 w-100"
            style={{
              transform: "translateY(15%)",
            }}
          >
            <img
              src={eclipse}
              alt="décoration"
              className="w-100"
              style={{
                maxHeight: "250px" /* Ajustez selon votre besoin */,
              }}  
            />
          </div>
        </div>

        {/* Header fixé */}
        <header
          className="container shadow-sm bg-transparent shadow-none "
          style={{
            position: "fixed",
            top: "40px",
            left: 0,
            right: 0,
            zIndex: 1000,
            margin: "0 auto",
            width: "calc(100% - 20px)",
          }}
        >
            <div className="container-fluid bg-gradiant rounded-3 p-1" style={{ width: "100%" }}>
            <div className="d-flex justify-content-between align-items-center py-1">
              <div className="d-flex align-items-center bg-white rounded-3 p-3">
              <img
                src={salama_logo}
                alt="Salama Logo"
                style={{ height: "40px", width: "40px" }}
              />
              </div>
              <div className="d-flex align-items-center gap-2">
            
                     <NotificationBell />
              {user ? (
                <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn bg-gradiant-btn text-dark rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2"
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ minWidth: "150px" }}
                >
                  <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: "30px", height: "30px" }}
                  >
                  <FiUser size={16} />
                  </div>
                  <span
                  className="text-truncate text-white"
                  style={{ maxWidth: "100px" }}
                  >
                  {user.name || user.login}
                  </span>
                </button>
                {showDropdown && (
                  <div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg py-2"
                  style={{
                    minWidth: "220px",
                    zIndex: 1001,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                  >
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-truncate">
                    {user.name || user.login}
                    </div>
                    <div className="small text-muted text-truncate">
                    {user.email}
                    </div>
                  </div>

                  <NavLink
                    to="/"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <FiSettings className="me-2" size={16} />
                    <span>Accueil</span>
                  </NavLink>
                  {/* <NavLink
                    to="/tableauSuivi"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <FiSettings className="me-2" size={16} />
                    <span>Tableau de bord</span>
                  </NavLink> */}
                  {/* ✅ Affichage du lien si le user est un bailleur */}
                  {user.profilable_type === "App\\Models\\Bailleur" && (
                    <NavLink
                    to="/offres/affectees"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                    >
                    <FiSettings className="me-2" size={16} />
                    <span>Mes offres affectées</span>
                    </NavLink>
                  )}

                  {/* <NavLink
                                to="/orders_client"
                                className="dropdown-item px-3 py-2 d-flex align-items-center"
                                onClick={() => setShowDropdown(false)}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <FiSettings className="me-2" size={16} />
                                <span>Commandes Sous-programme</span>
                              </NavLink> */}

                  {/* <NavLink
                                to="/orders_client/liste"
                                className="dropdown-item px-3 py-2 d-flex align-items-center"
                                onClick={() => setShowDropdown(false)}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <FiSettings className="me-2" size={16} />
                                <span>Commandes hors Programme</span>
                              </NavLink> */}

                   {((user.client_id || user?.role?.isadmin === 1 || 1===1)&& !user.fournisseur_id  ) && (
                  
                  <>
                  <NavLink
                    to="/listeType"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <FiSettings className="me-2" size={16} />
                    <span>Ajout Commandes</span>
                  </NavLink>

                  <NavLink
                    to="/orders_client"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <FiSettings className="me-2" size={16} />
                    <span>Liste Commande</span>
                  </NavLink>
                  </>
      )}
                 {user.fournisseur_id &&(  
                <>
                  
                  {fournisseur?.TSSCOD_0_0 !== "TRANS" && (
                    <>
                      {/* Fabricant/Validation */}
                      <NavLink
                        to="/fabricants"
                        className="dropdown-item px-3 py-2 d-flex align-items-center"
                        onClick={() => setShowDropdown(false)}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <FiSettings className="me-2" size={16} />
                        <span>Fabricant/Validation</span>
                      </NavLink>

                      {/* Suivi marché */}
                      <NavLink
                        to="/suiviMarche"
                        className="dropdown-item px-3 py-2 d-flex align-items-center"
                        onClick={() => setShowDropdown(false)}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <FiSettings className="me-2" size={16} />
                        <span>Suivi marché</span>
                      </NavLink>
                    </>
                  ) || (
                    <>
                          {/* Expedition */}
                  <NavLink
                    to="/portailTransporteur"
                    className="dropdown-item px-3 py-2 d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <FiSettings className="me-2" size={16} />
                    <span>Expedition</span>
                  </NavLink>
                    </>

                  )}

            
                
                </>
                )}

                  <button
                    className="dropdown-item px-3 py-2 d-flex align-items-center text-danger"
                    onClick={() => {
                    logout();
                    setShowDropdown(false);
                    navigate('/login');
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <FiLogOut className="me-2" size={16} />
                    <span>Déconnexion</span>
                  </button>
                  </div>
                )}
                </div>
              ) : (
                <NavLink
                to="/login"
                className="btn bg-gradiant-btn text-white rounded-3 px-4 py-3 fw-bold"
                >
                Se connecter
                </NavLink>
              )}
              </div>
            </div>
            </div>
        </header>

        {/* Modal À propos */}
        {showModal && (
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">À propos du portail SALAMA</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <Title
                    spanText="Bienvenue"
                    titleText="PORTAIL SALAMA, un seul portail pour piloter, visualiser  et gérer toutes les opérations clés du système de santé."
                    textColorH2="text-theme-claire"
                    align="center"
                  />
                  <p className="bg-green_ligth border-theme rounded-4 p-3">
                    Le Portail SALAMA est une plateforme centrale dédiée aux
                    fournisseurs, bailleurs, programmes, clients, transporteurs
                    et institutions publiques. Il constitue un outil stratégique
                    pour la gestion transparente et coordonnée des marchés liés
                    à l'approvisionnement en produits de santé, en lien avec les
                    ministères, programmes nationaux et partenaires techniques.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(SmallHeader);
