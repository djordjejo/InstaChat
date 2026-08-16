export default function SidebarMenu({ sidebarView, setSidebarView, onlineCount }) {
    const itemClass = (active) =>
        "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none " +
        (active
            ? "bg-blue-50 font-medium text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900");

    return (
        <div className="px-3 pt-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Menu
            </p>
            <nav className="flex flex-col gap-0.5">
                <button
                    onClick={() => setSidebarView("chats")}
                    aria-current={sidebarView === "chats" ? "page" : undefined}
                    className={itemClass(sidebarView === "chats")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Poruke
                </button>
                <button
                    onClick={() => setSidebarView("activeUsers")}
                    aria-current={sidebarView === "activeUsers" ? "page" : undefined}
                    className={itemClass(sidebarView === "activeUsers")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
                    </svg>
                    Aktivni korisnici
                    {onlineCount > 0 && (
                        <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {onlineCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
}
