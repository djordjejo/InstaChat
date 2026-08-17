import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Obrnuto od ProtectedRoute: vec prijavljenog korisnika sklanja sa /login
// i /register. Bez ovoga bi mogao da otvori formu za prijavu dok je ulogovan.
export default function PublicRoute({ children }) {
    const { user } = useAuth();

    if (user) return <Navigate to="/" replace />;

    return children;
}
