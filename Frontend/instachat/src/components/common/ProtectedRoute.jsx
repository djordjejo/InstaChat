import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Cuva rute koje traze prijavu. Bez ovoga je ukucavanje localhost:5173
// vodilo pravo na Chat, gde je "user" bio null i komponenta je pucala.
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();

    // replace, ne push - da Back dugme ne vraca na stranicu bez pristupa.
    if (!user) return <Navigate to="/login" replace />;

    return children;
}
