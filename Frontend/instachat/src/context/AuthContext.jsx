import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

// .NET upisuje claim-ove pod punim XML schema URI-jevima.
const CLAIM = {
    id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
};

const clearStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

const toUser = (decoded) => ({
    userId: decoded[CLAIM.id],
    username: decoded[CLAIM.name],
    email: decoded[CLAIM.email],
});

// Prisustvo tokena u localStorage NIJE dokaz da si ulogovan - token moze biti
// istekao ili potpisan starim kljucem. Ranije se korisnik citao iz "user"
// stavke bez ijedne provere, pa je UI prikazivao ulogovano stanje dok je
// svaki API poziv vracao 401.
const readSession = () => {
    const token = localStorage.getItem("token");
    if (!token) return { user: null, token: null };

    try {
        const decoded = jwtDecode(token);

        // "exp" je u sekundama, Date.now() u milisekundama.
        if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
            clearStorage();
            return { user: null, token: null };
        }

        return { user: toUser(decoded), token };
    } catch {
        // Neispravan token - tretiramo ga kao da ga nema.
        clearStorage();
        return { user: null, token: null };
    }
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(readSession);

    const login = (jwtToken) => {
        let decoded;
        try {
            decoded = jwtDecode(jwtToken);
        } catch {
            // Bacamo umesto da tiho upisemo pola stanja. LogIn.jsx ovo hvata
            // i prikazuje korisniku, umesto da aplikacija ostane u limbu.
            throw new Error("Server je vratio neispravan token.");
        }

        const userData = toUser(decoded);

        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setSession({ user: userData, token: jwtToken });
    };

    const logout = () => {
        clearStorage();
        setSession({ user: null, token: null });
    };

    return (
        <AuthContext.Provider
            value={{ user: session.user, token: session.token, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
