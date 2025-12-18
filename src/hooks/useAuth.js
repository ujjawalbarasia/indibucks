import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const initAuth = async () => {
            // Simulate checking for a token injected by server (if any) or existing sess
            // In strict React SPA, onAuthStateChanged handles persistence automatically.
            // The __initial_auth_token check was legacy or specific to some SSR setups. Keeping specific check if needed.
            if (typeof window !== 'undefined' && window.__initial_auth_token) {
                await signInWithCustomToken(auth, window.__initial_auth_token);
            } else {
                // Automatically sign in anonymously if not logged in? 
                // Logic in original App.jsx was to sign in anonymously if not detected?
                // Let's rely on onAuthStateChanged first, but original code had explicit init.
                // We will keep the anonymous sign-in if no user is present, to allow "Try IndiBuddy" features.
                // Waiting for auth state to resolve is better usually.
            }
        };
        initAuth();
        return onAuthStateChanged(auth, (u) => {
            if (!u) {
                // Original logic: await signInAnonymously(auth); 
                // Better to let user trigger login or do it here if we really want "guest" mode always on.
                // Following original code aggressive anonymous login:
                signInAnonymously(auth).catch(e => console.error("Anon Login Failed", e));
            } else {
                setUser(u);
            }
        });
    }, []);

    const loginGoogle = async () => await signInWithPopup(auth, googleProvider);
    const logout = async () => { await signOut(auth); window.location.reload(); };
    return { user, loginGoogle, logout };
};
