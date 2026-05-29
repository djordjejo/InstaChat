import { useRef, useCallback } from "react";

export function useTypingIndicator(connection, conversationId) {
    const isTypingRef = useRef(false);
    const timeoutRef = useRef(null);

    const startTyping = useCallback(() => {
        if (!connection || !conversationId) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            connection.invoke("StartTyping", conversationId)
                .catch(err => console.error("StartTyping err:", err));
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            connection.invoke("StopTyping", conversationId)
                .catch(err => console.error("StopTyping err:", err));
        }, 2000);
    }, [connection, conversationId]);

    const stopTyping = useCallback(() => {
        if (!connection || !conversationId) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (isTypingRef.current) {
            isTypingRef.current = false;
            connection.invoke("StopTyping", conversationId)
                .catch(err => console.error("StopTyping err:", err));
        }
    }, [connection, conversationId]);

    return { startTyping, stopTyping };
}