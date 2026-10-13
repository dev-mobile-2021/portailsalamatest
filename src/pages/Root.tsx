import { Outlet } from "react-router-dom";
import { memo } from "react";
// import Footer from "../components/const/Footer";
import { useAuthContext } from "../hooks/useUserhook";


const Root = () => {
    const { user } = useAuthContext();

    return (
        <div className="page-layout d-flex flex-column min-vh-100">


            <main className="flex-fill position-relative z-2">
                <Outlet context={{ user }} />
            </main>
{/* 
            <div className="footer-wrapper position-relative">
                <Footer />
                <img src={vague} alt="Vague décorative" className="footer-wave" />
            </div> */}
        </div>
    );
};

export default memo(Root);
