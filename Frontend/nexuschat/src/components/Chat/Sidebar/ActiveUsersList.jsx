import Avatar from "../../common/Avatar";

export default function ActiveUsersList({ users, onCreateChat }) {
    return (
        <>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Aktivni korisnici
            </p>
            {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 pt-12 text-center">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300" aria-hidden="true">
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <p className="text-xs text-slate-400">Nema aktivnih korisnika</p>
                </div>
            ) : (
                <div className="flex flex-col gap-0.5">
                    {users.map((u) => (
                        <button
                            key={u.userId}
                            onClick={() => onCreateChat(u.userId)}
                            className="flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                        >
                            <span className="relative">
                                <Avatar
                                    initials={u.username?.slice(0, 2).toUpperCase()}
                                    size="sm"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{u.username}</span>
                                <span className="block text-xs text-emerald-600">Online</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
