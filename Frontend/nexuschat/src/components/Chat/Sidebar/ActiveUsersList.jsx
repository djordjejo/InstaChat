import Avatar from "../../common/Avatar";

export default function ActiveUsersList({ users, onCreateChat }) {

    return (
        <>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">
                Aktivni korisnici
            </p>
            {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 pt-12 text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8]">
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <p className="text-xs text-[#94a3b8]">Nema aktivnih korisnika</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {users.map(u => (
                        <div
                            key={u.userId}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-black/5 cursor-pointer"
                            onClick={ () => onCreateChat(u.userId) }
                        >
                            <div className="relative">
                                <Avatar initials={u.username?.slice(0, 2).toUpperCase()} size="sm" />
                                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[#e0effe]" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium text-[#1e293b]">{u.username}</p>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
