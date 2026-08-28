import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";

// Nema vise modul-level "connection" promenljive. Ranije ju je svaki poziv
// createConnection prepisivao, pa je getConnection() umeo da vrati zaustavljenu
// instancu iz prethodnog mounta. Zivotni vek konekcije drzi useSignalRConnection
// kroz useRef - to je jedino mesto koje o njoj treba da zna.
export const createConnection = (token) =>
    new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/chat`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();
