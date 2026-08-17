import { useState, useEffect } from "react";

export function useOnlineUsers(connection, currentUser) {
    const [onlineUsers, setOnlineUsers] = useState(new Map());

    useEffect(() => {
        if (!connection) return;

        // Handleri se drze u promenljivama da bi se u cleanup-u mogli skinuti.
        // Anonimne funkcije prosledjene u connection.on() se ne mogu odjaviti,
        // a StrictMode u razvoju pokrece efekat DVAPUT - bez off()-a bi na
        // konekciji ostajala po dva handlera i svaki dogadjaj bi se obradio
        // dvostruko. Danas je bezopasno jer je Map.set idempotentan, ali cim
        // se doda brojac ili zvucna notifikacija - duplira se.
        const handleUserOnline = (onlineUser) => {
            setOnlineUsers((prev) => {
                const next = new Map(prev);
                next.set(onlineUser.userId, onlineUser);
                return next;
            });
        };

        const handleUserOffline = (userId) => {
            setOnlineUsers((prev) => {
                if (!prev.has(userId)) return prev;
                const next = new Map(prev);
                next.delete(userId);
                return next;
            });
        };

        connection.on("UserOnline", handleUserOnline);
        connection.on("UserOffline", handleUserOffline);

        connection
            .invoke("GetOnlineUsers")
            .then((initial) => {
                const usersMap = new Map();
                initial.forEach((u) => usersMap.set(u.userId, u));
                setOnlineUsers(usersMap);
            })
            .catch((err) =>
                console.error("Greška pri uzimanju online korisnika:", err)
            );

        return () => {
            connection.off("UserOnline", handleUserOnline);
            connection.off("UserOffline", handleUserOffline);
        };
    }, [connection]);

    // Filtriranje po userId, ne po username. Username nije jedinstven u bazi
    // (nema unique indeks), pa bi se sa dva ista imena sakrio pogresan covek.
    const myId = currentUser?.userId?.toLowerCase();

    const otherOnlineUsers = Array.from(onlineUsers.values()).filter(
        (u) => u.userId?.toLowerCase() !== myId
    );

    return { onlineUsers, otherOnlineUsers };
}
