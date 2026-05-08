export default function SidebarMenu({ sidebarView, setSidebarView, onlineCount }) {
    return (
        <div className="px-4 pt-5">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">Menu</p>
            <nav className="flex flex-col gap-0.5">
                <button
                    onClick={() => setSidebarView("chats")}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${sidebarView === "chats" ? "bg-blue-600/10 text-blue-700" : "text-[#64748b] hover:bg-black/5 hover:text-[#1e293b]"}`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Poruke
                </button>
                <button
                    onClick={() => setSidebarView("activeUsers")}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${sidebarView === "activeUsers" ? "bg-blue-600/10 text-blue-700" : "text-[#64748b] hover:bg-black/5 hover:text-[#1e293b]"}`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
                    </svg>
                    Aktivni korisnici
                    {onlineCount > 0 && (
                        <span className="ml-auto rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {onlineCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
}
