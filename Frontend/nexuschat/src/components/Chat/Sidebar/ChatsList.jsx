import Avatar from "../../common/Avatar";

export default function ChatsList({ chats, activeChatId, onChatSelect, unreadMessages }) {
    return (
        <>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">Prethodne poruke</p>
            <div className="flex flex-col gap-1">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 pt-12 text-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8]">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p className="text-xs text-[#94a3b8]">Nema prethodnih poruka</p>
                    </div>
                ) : (
                    chats.map((c) => {
                        const unreadCount = unreadMessages?.get(c.conversationId) || 0;
                        const hasUnread = unreadCount > 0;

                        return (
                            <div
                                key={c.conversationId}
                                onClick={() => onChatSelect(c.conversationId)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${activeChatId === c.conversationId ? "bg-blue-600/10" : "hover:bg-black/5"}`}
                            >
                                <Avatar initials={c.conversationName?.slice(0, 2).toUpperCase()} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className={`truncate ${hasUnread ? "font-semibold text-[#0f172a]" : "font-medium text-[#1e293b]"}`}>
                                        {c.conversationName}
                                    </p>
                                    <p className="text-xs text-[#64748b] truncate">{c.lastMessage}</p>
                                </div>
                                {hasUnread && (
                                    <span className="flex-shrink-0 rounded-full bg-green-500 text-white text-xs font-semibold leading-none py-1 px-2">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}