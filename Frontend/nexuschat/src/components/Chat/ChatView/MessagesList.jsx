import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessagesList({ messages, user }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#f8fbff]">
            <p className="text-xs text-[#94a3b8] text-center">Početak razgovora</p>
            {messages.map((message) => (
                <MessageBubble
                    key={message.messageId}
                    message={message}
                    isMyMessage={message.senderUsername === user}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
