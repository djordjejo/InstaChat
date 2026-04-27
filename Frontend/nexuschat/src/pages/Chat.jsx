import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getChats, viewChat } from "../api/chatsApi";

function Avatar({ initials, size = "md" }) {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-16 w-16 text-xl",
    };
    return (
        <div className={`${sizes[size]} rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-semibold text-blue-700 shrink-0`}>
            {initials}
        </div>
    );
}

export default function Chat() {
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [chat, setChat] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const navigate = useNavigate();
    const [sidebarView, setSidebarView] = useState("chats");

    const initials = user.slice(0, 2).toUpperCase();

    useEffect(() => {
        const fetchChats = async () => {
            const ch = await getChats();
            setChats(ch ?? []);
        };
        fetchChats();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;
        const fetchChat = async () => {
            const c = await viewChat(activeChatId);
            setChat(c ?? null);
        };
        fetchChat();
    }, [activeChatId]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleStartChat = (chatId) => {
        setActiveChatId(chatId);
    };

    return (
        <div style={{ backgroundColor: "#f0f7ff" }} className="flex h-screen w-full overflow-hidden text-[#1e293b]">
            {/* SIDEBAR */}
            <aside className="flex w-64 shrink-0 flex-col border-r border-black/[0.06] bg-[#e0effe]">

                {/* Korisnik */}
                <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                    <Avatar initials={initials} size="sm" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1e293b]">{user}</p>
                        <p className="text-xs text-green-500">Online</p>
                    </div>
                </div>

                {/* Menu */}
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
                        </button>
                    </nav>
                </div>

                {/* Lista chatova */}
                <div className="flex-1 overflow-y-auto px-4 pt-5">
                    {sidebarView === "chats" && (
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
                                    chats.map((c) => (
                                        <div
                                            key={c.conversationsId}
                                            onClick={() => handleStartChat(c.conversationsId)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${activeChatId === c.conversationsId ? "bg-blue-600/10" : "hover:bg-black/5"}`}
                                        >
                                            <Avatar initials={c.conversationName?.slice(0, 2).toUpperCase()} size="sm" />
                                            <div>
                                                <p className="font-medium text-[#1e293b]">{c.conversationName}</p>
                                                <p className="text-xs text-[#64748b]">{c.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {sidebarView === "activeUsers" && (
                        <>
                            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">Aktivni korisnici</p>
                            <div className="flex flex-col items-center justify-center gap-2 pt-12 text-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8]">
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                </svg>
                                <p className="text-xs text-[#94a3b8]">Nema aktivnih korisnika</p>
                            </div>
                        </>
                    )}

                    {sidebarView === "profile" && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Avatar initials={initials} size="lg" />
                            <div className="text-center">
                                <p className="text-base font-semibold text-[#1e293b]">{user}</p>
                            </div>
                            <div className="w-full rounded-xl border border-black/[0.06] bg-white/60 p-4">
                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#64748b]">Status</span>
                                        <span className="text-green-500">Online</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#64748b]">Član od</span>
                                        <span className="text-[#1e293b]">Apr 2026</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                            >
                                Odjavi se
                            </button>
                        </div>
                    )}
                </div>

                {/* Dno */}
                <div className="flex flex-col gap-0.5 border-t border-black/[0.06] px-4 py-3">
                    <button
                        onClick={() => setSidebarView(sidebarView === "profile" ? "chats" : "profile")}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${sidebarView === "profile" ? "bg-blue-600/10 text-blue-700" : "text-[#64748b] hover:bg-black/5 hover:text-[#1e293b]"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        Moj profil
                    </button>
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748b] transition hover:bg-black/5 hover:text-[#1e293b]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Podešavanja
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            {chat == null ? (
                <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f0f7ff]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-semibold text-[#1e293b]">Dobrodošao, {user}</p>
                        <p className="mt-1 text-sm text-[#64748b]">Izaberi razgovor ili pokreni novi</p>
                    </div>
                </main>
            ) : (
                <main className="flex flex-1 flex-col bg-[#f0f7ff]">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#e0effe] px-5 py-3">
                        <Avatar initials={chat?.conversationName?.slice(0, 2).toUpperCase()} size="sm" />
                        <div>
                            <p className="text-sm font-semibold text-[#1e293b]">{chat?.conversationName}</p>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>

                    {/* Poruke */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                        <p className="text-xs text-[#94a3b8] text-center">Početak razgovora</p>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-3 border-t border-black/[0.06] bg-[#e0effe] px-4 py-3">
                        <input
                            type="text"
                            placeholder="Napiši poruku..."
                            className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-[#1e293b] outline-none border border-black/[0.08] focus:border-blue-400"
                        />
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] transition">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </main>
            )}
        </div>
    );
}