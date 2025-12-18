import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDALtiUuYzJDh3F5hQ5mmqGmxspzH3K2sM",
    authDomain: "indibucks-cd137.firebaseapp.com",
    projectId: "indibucks-cd137",
    storageBucket: "indibucks-cd137.firebasestorage.app",
    messagingSenderId: "1051808853082",
    appId: "1:1051808853082:web:543ba0b40d7fb778e07c63",
    measurementId: "G-7VE27ZDW86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "indibucks-cd137";
export const googleProvider = new GoogleAuthProvider();
