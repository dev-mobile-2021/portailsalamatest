import { initializeApp } from "firebase/app";
import { FacebookAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBrW7bNGfczmGAtifWdWJDpEr9pE9DlqN8",
    authDomain: "auth-facebook-32aee.firebaseapp.com",
    projectId: "auth-facebook-32aee",
    storageBucket: "auth-facebook-32aee.firebasestorage.app",
    messagingSenderId: "1053969028275",
    appId: "1:1053969028275:web:104d539a6f5bcafc9b4cc6",
    measurementId: "G-N8DYZQ07Q5"
};
const app = initializeApp(firebaseConfig);
// provider

const provider = new GoogleAuthProvider();

const facebookprovider = new FacebookAuthProvider();





export const auth = getAuth(app);

export default { provider, facebookprovider };