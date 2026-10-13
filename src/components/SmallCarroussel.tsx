import { Carousel } from "react-bootstrap";
import {useState} from "react";
import photo_salamane from "../assets/images/salaman_image.png";
// Removed unused imports
import Title from "./const/Title";
import fleur from "../assets/images/fleure.png";

const SmallCarrousel = () => {
  const [showModal, setShowModal] = useState(false);
    return (
        <>
        <Carousel interval={3000} pause="hover" indicators={false} controls={false} className="z-2">
            <Carousel.Item>
                <img
                    className="d-block w-100 rounded-4"
                    src={photo_salamane}
                    alt="slide"
                    style={{
                        maxHeight: '18vh',
                        objectFit: 'cover'
                    }}
                />

           
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

export default SmallCarrousel;

