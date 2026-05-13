import { useState, useEffect, useRef } from "react";
import { createConnection } from "../services/signalRService";
import { HubConnectionState } from "@microsoft/signalr";

export function useSignalRConnection() {
    const [connection, setConnection] = useState(null);
    const connRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const conn = createConnection(token);
        connRef.current = conn;

        conn.start()
            .then(() => {
                if (connRef.current === conn) {
                    setConnection(conn);
                }
            })
            .catch(err => {
                const msg = String(err?.message || err);
                const isAbort = 
                    err?.name === 'AbortError' || 
                    msg.includes('stopped during negotiation') ||
                    msg.includes('AbortError');
                
                if (!isAbort) {
                    console.error("SignalR greska:", err);
                }
            });

        return () => {
            connRef.current = null;
            if (conn.state === HubConnectionState.Connected) {
                conn.stop();
            }
        };
    }, []);

    return connection;
}