import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(() => {
    try {
        const userStr = localStorage.getItem("user");
        const tokenStr = localStorage.getItem("token");
        if (!userStr || !tokenStr) return null;
        
        const decoded = jwtDecode(tokenStr);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
        return JSON.parse(userStr);
    } catch {
        return null;
    }
});

    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const login = (jwtToken) => {
        const decoded = jwtDecode(jwtToken);

         const userData = {
            userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
            email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
        };

        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
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

export const useAuth = () => useContext(AuthContext);