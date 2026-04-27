import { createContext, useContext,  useState } from "react";

export const AuthContext = createContext(); 
// => createContext() vraca objekat, zato se stavlja veliko prvo pocetno slovo u imenu variable
// the default value set when creating the context is only used if a compomennt that was not weapped by the Provider components
//  tries to access the context value

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
             return JSON.parse(localStorage.getItem("user")) || null;
             }
        catch { return null; }
    });
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const login = (userName, jwtToken) => {
        console.log("Logging in user:", userName);
        setUser(userName);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userName));
        localStorage.setItem("token", jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook za lakse koriscenje
export const useAuth = () => useContext(AuthContext);