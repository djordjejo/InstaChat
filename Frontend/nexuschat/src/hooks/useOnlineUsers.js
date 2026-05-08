import { useState, useEffect } from "react";

export function useOnlineUsers(connection, currentUsername) {
    const [onlineUsers, setOnlineUsers] = useState(new Map());

    useEffect(() => {
        if (!connection) return;

        connection.on("UserOnline", (onlineUser) => {
            setOnlineUsers(prev => {
                const next = new Map(prev);
                next.set(onlineUser.userId, onlineUser);
                return next;
            });
        });

        connection.on("UserOffline", (userId) => {
            setOnlineUsers(prev => {
                const next = new Map(prev);
                next.delete(userId);
                return next;
            });
        });

        connection.invoke("GetOnlineUsers")
            .then(initial => {
                const usersMap = new Map();
                initial.forEach(u => usersMap.set(u.userId, u));
                setOnlineUsers(usersMap);
            })
            .catch(err => console.error("Greška pri uzimanju online korisnika:", err));
    }, [connection]);

    const otherOnlineUsers = Array.from(onlineUsers.values())
        .filter(u => u.username !== currentUsername);

    return { onlineUsers, otherOnlineUsers };
}
