import { Container } from "react-bootstrap";
import { Outlet, useOutletContext } from "react-router-dom";
import LoginForm from "../components/const/LoginForm";

const Profile = () => {
    const { user, signInWithGoogle, signInWithFacebook } = useOutletContext<{ user: any; isAuthLoading: boolean, signInWithFacebook: () => Promise<void>, signInWithGoogle: () => Promise<void> }>();



    if (!user) {
        return <div className="m-auto d-flex justify-content-center  w-100 my-5" >
            <div className="rounded-4 border-noir   m-0 p-0">
                <LoginForm signInWithFacebook={signInWithFacebook} signInWithGoogle={signInWithGoogle} />
            </div>
        </div>;
    }

    return (
        <Container className="my-5">
            <Outlet context={{ user }}></Outlet>
        </Container>
    );
};

export default Profile;
