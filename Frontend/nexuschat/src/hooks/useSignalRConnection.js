import { useState, useEffect, useRef } from "react";
import { createConnection } from "../services/signalRService";

export function useSignalRConnection(setMessages) {
    const [connection, setConnection] = useState(null);
    const connectingRef = useRef(false);

    useEffect(() => {
        if (connectingRef.current) return;
        connectingRef.current = true;

        const token = localStorage.getItem("token");
        const conn = createConnection(token);

        conn.on("ReceiveMessage", (message) => {
            setMessages(prev => [...prev, message]);
        });

        conn.start()
            .then(() => setConnection(conn))
            .catch(err => console.error("SignalR greska:", err));

        return () => {
            connectingRef.current = false;
            conn.stop();
        };
    }, []);

    return connection;
}
