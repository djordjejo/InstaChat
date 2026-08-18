import { useState, useRef, useEffect } from "react";
import Avatar from "../../common/Avatar";
import { getInitials } from "../../../utility/getInitials";

export default function ChatHeader({ chat, isPeerOnline, onDeleteChat }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleDelete = () => {
        setMenuOpen(false);
        if (window.confirm("Da li ste sigurni da želite da obrišete ovaj razgovor?")) {
            onDeleteChat?.();
        }
    };

    // Status se racuna, ne hardkoduje. Za grupu se prikazuje broj clanova,
    // jer "Online" nad grupom od 8 ljudi nista ne znaci.
    const status = chat?.isGroup
        ? `${chat?.members?.length ?? 0} članova`
        : isPeerOnline
          ? "Online"
          : "Offline";

    return (
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar
                    initials={getInitials(chat?.conversationName)}
                    size="sm"
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {chat?.conversationName}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        {!chat?.isGroup && (
                            <span
                                className={
                                    "h-1.5 w-1.5 rounded-full " +
                                    (isPeerOnline ? "bg-emerald-500" : "bg-slate-300")
                                }
                            />
                        )}
                        {status}
                    </p>
                </div>
            </div>

            <div className="relative shrink-0" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Opcije razgovora"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>

                {menuOpen && (
                    <div
                        role="menu"
                        className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10"
                    >
                        <button
                            role="menuitem"
                            onClick={handleDelete}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 motion-reduce:transition-none"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
