import { Carousel } from "react-bootstrap";
import {useState} from "react";
import photo_salamane from "../assets/images/salaman_image.png";
import { FaBullhorn, FaCalendar, FaInfo } from "react-icons/fa";
import Title from "./const/Title";
import fleur from "../assets/images/fleure.png";

const Carrousel = () => {
  const [showModal, setShowModal] = useState(false);
    return (
        <>
        <Carousel interval={3000} pause="hover" indicators={false} controls={false} className="z-2">
            <Carousel.Item>
                <img
                    className="d-block w-100 rounded-5"
                    src={photo_salamane}
                    alt="slide"
                    style={{
                        maxHeight: '80vh',
                        objectFit: 'cover'
                    }}
                />

                <Carousel.Caption className="custom-caption">
                    <div className="card px-5 py-5 bg-white-ligth border-0 w-100">
                        <div className="d-flex justify-content-between">
                            {/* Premier bouton avec icône */}
                            <div className="d-flex flex-column align-items-center position-relative" style={{ width: "48%" }}>
                                <div className="icon-container border-5">
                                    <FaBullhorn className="icon-img text-white" />
                                </div>
                                <div className="icon-arc"></div>
                                <button className="btn-button text-white rounded-5 px-3 py-2 w-100">
                                    Appels d'offres (10)
                                </button>
                            </div>

                            {/* Deuxième bouton avec icône */}
                            <div className="d-flex flex-column align-items-center position-relative" style={{ width: "48%" }}>
                                <div className="icon-container border-5">
                                    <FaCalendar className="icon-img text-white" />
                                </div>
                                <div className="icon-arc"></div>
                                <button className="btn-button text-white rounded-5 px-3 py-2 w-100">
                                    Campagnes sanitaires
                                </button>
                            </div>
                        </div>

                        {/* Bouton "En savoir plus" */}
                        <div className="d-flex justify-content-center mt-3 ">
                            <button className="btn-button bg-blanc text-white rounded-5 px-3 py-2 w-100">
                                A propos du portail SALAM... En savoir + <FaInfo className="icon-img    text-theme" onClick={() => setShowModal(true)}/>
                            </button>
                        </div>
                    </div>
                </Carousel.Caption>

                {/* Autres éléments du carrousel */}
                <Carousel.Caption className="custom-caption-b">
                    <div className="bg-compteur"></div>
                </Carousel.Caption>
                <Carousel.Caption className="custom-caption-c d-flex flex-column align-items-center" style={{ marginBottom: "60px" }}>
                    <span className="arrow" />
                    <span className="arrow" />
                    <span className="arrow" />
                </Carousel.Caption>
               
            </Carousel.Item>
        </Carousel>
            {showModal && (
                            <div className="modal d-block" tabIndex={-1} role="dialog" 
                            style={{ backgroundColor: "rgba(0,0,0,0.5)"}}
                             onClick={() => setShowModal(false)}
                            >
                                <div className="modal-dialog modal-xl modal-dialog-centered" role="document" >
                                    <div className="rounded-4 py-3" style={{ backgroundColor: "white"}} onClick={(e) => e.stopPropagation()}>
                                       
                                       <div className="d-flex align-items-center mb-4">
                                        <div>
                                            <img src={fleur} alt="" style={{position:"absolute", right:"30px", bottom:"220px", width:"150px"}}/>
                                        </div>
                                        <div>
                                            <img src={fleur} alt="" style={{position:"absolute", right:"80px", bottom:"190px", width:"100px"}}/>
                                        </div>
                                               <div className=" p-3" style={{width: "89%", marginLeft: "35px"}}
                                                onClick={(e) => e.stopPropagation()}>
                                            <div className="" style={{ marginLeft: "60px", width: "140vh" }}>
                                            <Title
                                                spanText="Bienvenue"
                                                titleText="PORTAIL SALAMA, un seul portail pour piloter, visualiser et gérer toutes les opérations clés du système de santé."
                                                textColorH2="text-theme-claire fw-bold" 
                                                align="center"
                                            />
                                            </div>
                                            <p className="bg-green_ligth border-theme rounded-4 px-5 py-3" style={{fontSize:"0.75rem"}}>
                                               Le Portail SALAMA est une plateforme centrale dédiée aux fournisseurs, bailleurs, programmes, clients, transporteurs et institutions publiques.
                                               Il constitue un outil stratégique pour la gestion transparente et coordonnée des marchés liés à l’approvisionnement en produits de santé, en lien avec les ministères, programmes nationaux et partenaires techniques.
                                            </p>
                                        </div>
                                       
                                    </div> 
                                    </div>
                                </div>
                            </div>
                        )}
    </>
    );
};

export default Carrousel;

