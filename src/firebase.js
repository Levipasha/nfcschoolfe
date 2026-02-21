import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCN7B9NYVDUvxqWiVhDE68lcrfsbOGHTRA",
    authDomain: "nanoprofiles-b92d6.firebaseapp.com",
    projectId: "nanoprofiles-b92d6",
    storageBucket: "nanoprofiles-b92d6.firebasestorage.app",
    messagingSenderId: "722906539476",
    appId: "1:722906539476:web:a7d83d7c9241dbcd9d6241",
    measurementId: "G-32Q63VGL9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google Popup", error);
        // If popup is blocked or COOP issues occur, try redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
            await signInWithRedirect(auth, googleProvider);
        }
        throw error;
    }
};

export const googleRedirectLogin = () => {
    return signInWithRedirect(auth, googleProvider);
};

export const getGoogleRedirectResult = () => {
    return getRedirectResult(auth);
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error signing in with email", error);
        throw error;
    }
};

export const signUpWithEmail = async (email, password) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error signing up with email", error);
        throw error;
    }
};

export { onAuthStateChanged };

export default app;
