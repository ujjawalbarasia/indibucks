import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const authData = useAuth();
    const [view, setView] = useState('home');
    const [showLogin, setShowLogin] = useState(false);

    return (
        <AppContext.Provider value={{ ...authData, view, setView, showLogin, setShowLogin }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
