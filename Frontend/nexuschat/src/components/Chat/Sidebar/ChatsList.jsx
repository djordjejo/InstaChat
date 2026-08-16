import Avatar from "../../common/Avatar";

export default function ChatsList({ chats, activeChatId, onChatSelect, unreadMessages }) {
    const heading = (
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Prethodne poruke
        </p>
    );

    if (chats.length === 0) {
        return (
            <>
                {heading}
                <div className="flex flex-col items-center justify-center gap-2 pt-12 text-center">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="text-xs text-slate-400">Nema prethodnih poruka</p>
                </div>
            </>
        );
    }

    return (
        <>
            {heading}
            <div className="flex flex-col gap-0.5">
                {chats.map((c) => {
                    const unreadCount = unreadMessages?.get(c.conversationId) || 0;
                    const hasUnread = unreadCount > 0;
                    const isActive = activeChatId === c.conversationId;

                    return (
                        <button
                            key={c.conversationId}
                            onClick={() => onChatSelect(c.conversationId)}
                            aria-current={isActive ? "true" : undefined}
                            className={
                                "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none " +
                                (isActive
                                    ? "bg-blue-50 text-blue-900"
                                    : "text-slate-700 hover:bg-slate-100")
                            }
                        >
                            <Avatar
                                initials={c.conversationName?.slice(0, 2).toUpperCase()}
                                size="sm"
                            />
                            <span className="min-w-0 flex-1">
                                <span
                                    className={
                                        "block truncate " +
                                        (hasUnread ? "font-semibold text-slate-900" : "font-medium")
                                    }
                                >
                                    {c.conversationName}
                                </span>
                            </span>
                            {hasUnread && (
                                <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}
