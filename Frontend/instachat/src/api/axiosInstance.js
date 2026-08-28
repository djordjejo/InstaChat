import axios from "axios";

// Bez fallback-a bi greska bila tiha: baseURL "undefined/api" i svaki poziv
// puca sa neinformativnim "Network Error".
const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Kad token istekne, backend vraca 401 na svaki poziv, a aplikacija je do sada
// nastavljala da prikazuje ulogovano stanje - korisnik je gledao praznu listu
// razgovora bez ikakvog objasnjenja. Sada ga odmah izbacujemo na prijavu.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Puna navigacija umesto react-router navigate(): interceptor zivi
            // van React stabla i nema pristup ruteru. Reload usput obara i
            // SignalR konekciju, koja je ionako nevazeca sa isteklim tokenom.
            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
