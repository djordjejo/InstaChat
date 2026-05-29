import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import LogIn from "./pages/LogIn.jsx";
import Chat from "./pages/Chat.jsx";
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
export default App