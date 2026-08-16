import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useAuth } from "../../../context/AuthContext";
import { formatDayLabel, isSameDay } from "../../../utility/formatTime";

export default function MessagesList({ messages }) {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // GUID-ovi se porede malim slovima - .NET ih serijalizuje malim, ali je
    // poredjenje stringova osetljivo na velicinu pa je ovo osiguranje.
    const myId = user?.userId?.toLowerCase();

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Još nema poruka</p>
                <p className="text-xs text-slate-400">Napiši prvu i pokreni razgovor.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto bg-slate-50 px-4 py-5 md:px-6">
            {messages.map((message, index) => {
                const previous = messages[index - 1];
                const isMyMessage = message.senderId?.toLowerCase() === myId;

                const newDay =
                    !previous || !isSameDay(previous.sentAt, message.sentAt);

                // Meta (avatar + ime) se prikazuje samo na prvoj poruci u nizu
                // istog posiljaoca, ili posle prelaza na novi dan.
                const showMeta =
                    newDay || !previous || previous.senderId !== message.senderId;

                return (
                    <div key={message.messageId} className="flex flex-col">
                        {newDay && (
                            <div className="my-4 flex items-center gap-3">
                                <span className="h-px flex-1 bg-slate-200" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    {formatDayLabel(message.sentAt)}
                                </span>
                                <span className="h-px flex-1 bg-slate-200" />
                            </div>
                        )}

                        <div className={showMeta ? "mt-3 first:mt-0" : ""}>
                            <MessageBubble
                                message={message}
                                isMyMessage={isMyMessage}
                                showMeta={showMeta}
                            />
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
