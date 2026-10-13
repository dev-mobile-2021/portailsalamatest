import { useAuthContext } from "../hooks/useUserhook";
import { Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const { user} = useAuthContext();

    if (!user) {
        return <div className="m-auto d-flex justify-content-center  w-100 my-0" >
            <div className="rounded-4 border-noir   m-0 p-0">
                {/* <LoginForm  /> */}
            </div>
        </div>;
    }

    return <Outlet />;
};

export default ProtectedRoute;
