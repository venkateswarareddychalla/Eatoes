import { createContext, useContext } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const API_URL = 'http://localhost:3000/api';

    const value = {
        API_URL
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}


export const useAppContext = () => {
    return useContext(AppContext);
}