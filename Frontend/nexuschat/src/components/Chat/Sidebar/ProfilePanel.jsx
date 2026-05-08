import Avatar from "../../common/Avatar";

export default function ProfilePanel({ user, initials, onLogout }) {
    return (
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
                onClick={onLogout}
                className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
                Odjavi se
            </button>
        </div>
    );
}
