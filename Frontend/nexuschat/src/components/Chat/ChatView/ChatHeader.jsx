import Avatar from "../../common/Avatar";
import { deleteChat } from "../../../api/chatsApi";
import { useState, useRef, useEffect } from "react";
export default function ChatHeader({ chat, onDeleteChat }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

     const handleDelete = () => {
        setMenuOpen(false);
        if (window.confirm("Da li ste sigurni da želite da obrišete ovaj razgovor?")) {
            onDeleteChat?.();
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-black/[0.06] bg-white/40 backdrop-blur-sm px-5 py-3">
            {/* Levi deo — avatar + ime */}
            <div className="flex items-center gap-3">
                <Avatar initials={chat?.conversationName?.slice(0, 2).toUpperCase()} size="sm" />
                <div>
                    <p className="text-sm font-semibold text-[#1e293b]">{chat?.conversationName}</p>
                    <p className="text-xs text-green-500">Online</p>
                </div>
            </div>

            {/* Desni deo — 3 tačkice + dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition hover:bg-black/5 hover:text-[#1e293b]"
                    aria-label="Opcije razgovora"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-lg">
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#1e293b] transition hover:bg-black/5"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            Vidi profil
                        </button>

                        <button
                            onClick={() => setMenuOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#1e293b] transition hover:bg-black/5"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
                                <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
                                <path d="M18 8a6 6 0 0 0-9.33-5" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                            Isključi notifikacije
                        </button>

                        <button
                            onClick={() => setMenuOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#1e293b] transition hover:bg-black/5"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 9h6v6H9z" />
                            </svg>
                            Arhiviraj razgovor
                        </button>

                        {/* Separator pre destruktivne akcije */}
                        <div className="h-px bg-black/[0.06]" />

                        <button
                            onClick={handleDelete}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                            Obriši razgovor
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}


