import { useState, useEffect, useRef } from "react";
import { createConnection } from "../services/signalRService";

export function useSignalRConnection() {
    const [connection, setConnection] = useState(null);
    const connRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const conn = createConnection(token);
        connRef.current = conn;

        let disposed = false;

        conn.start()
            .then(() => {
                // Ako je efekat u medjuvremenu ociscen - StrictMode dvostruki
                // mount u razvoju, ili odjava - konekciju odmah gasimo.
                // Bez ovoga bi ostala otvorena, server bi je i dalje vodio kao
                // aktivnu, i korisnik bi zauvek bio "online".
                if (disposed) {
                    conn.stop().catch(() => {});
                    return;
                }
                setConnection(conn);
            })
            .catch((err) => {
                const msg = String(err?.message || err);
                const isAbort =
                    err?.name === "AbortError" ||
                    msg.includes("stopped during negotiation") ||
                    msg.includes("AbortError");

                if (!isAbort) {
                    console.error("SignalR greška:", err);
                }
            });

        return () => {
            disposed = true;
            connRef.current = null;

            // stop() je bezbedan u SVAKOM stanju. Ranije se zvao samo kad je
            // state === Connected, pa je konekcija zatecena u "Connecting"
            // ostajala da visi. Posledica: korisnik je imao dve konekcije na
            // serveru, i posle odjave je IsOnline() i dalje vracao true -
            // ostali klijenti nikad nisu dobili "UserOffline".
            conn.stop().catch(() => {});
        };
    }, []);

    return connection;
}
