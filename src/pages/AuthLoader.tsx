import { useEffect } from "react";
import { useAuthContext } from "../hooks/useUserhook";
import HomePage from "../pages/HomePage";
import Spiner from "../components/const/Spiner";

const AuthLoader = () => {
    const { user, isLoading } = useAuthContext();

    useEffect(() => {
        console.log("isAuthenticated:");
    }, [user, isLoading]);


    if (isLoading) {
        return <Spiner />;
    }



    return <HomePage />; // Passer l'utilisateur à HomePage via les props
};

export default AuthLoader;