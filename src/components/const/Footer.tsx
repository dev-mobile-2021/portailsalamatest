import React from "react";

import facebook from "../../assets/images/facebook.png";
import instagram from "../../assets/images/instagram.png";
import youtube from "../../assets/images/youtube.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-white pt-4 pb-2">
      <div className="container">
        {/* Top section */}
        <div className="row align-items-center gy-3">

          {/* Newsletter */}
          <div className="col-lg-5">
            <p className="mb-2 fw-semibold">ABONNEZ-VOUS À NOTRE NEWSLETTER</p>
            <div className="d-flex bg-white p-1 rounded overflow-hidden">
              <input
                type="email"
                className="form-control border-0 rounded-0 shadow-none"
                placeholder="Entrez votre mail"
              />
              <button className="btn btn-success px-1 py-0 fw-bold">
                S’inscrire
              </button>
            </div>
          </div>

          {/* Nous contacter */}
          <div className="col-lg-4 d-flex justify-content-center">
            {/* <button className="bg-white text-success btn rounded shadow-sm d-flex align-items-center     px-4 py-2 gap-2">
              <img src={telephone} alt="telephone" width={22} />
              <span className="fw-bold">Nous contacter</span>
            </button> */}
          </div>

          {/* Réseaux sociaux */}
          <div className="col-lg-3 text-center text-lg-end">
            <p className="mb-2 fw-semibold">SUIVEZ-NOUS</p>
            <div className="d-flex justify-content-center justify-content-lg-end gap-3">
              <img src={facebook} alt="facebook" width={24} height={24} />
              <img src={instagram} alt="instagram" width={24} height={24} />
              <img src={youtube} alt="youtube" width={24} height={24} />
            </div>
          </div>
        </div>

        <hr className="border-white opacity-25 my-4" />

        {/* Bottom section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small">
          <div className="d-flex gap-3 mb-2 mb-md-0">
            <a href="#" className="text-white text-decoration-none">SALAMA</a>
            <a href="#" className="text-white text-decoration-none">Confidentialité</a>
            <a href="#" className="text-white text-decoration-none">Conditions</a>
          </div>
          <div className="text-center text-md-end">
            2025© Design HTSOFT. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
