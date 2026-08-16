import Avatar from "../../common/Avatar";
import { useAuth } from "../../../context/AuthContext";

export default function ProfilePanel({ initials, onLogout }) {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <Avatar initials={initials} size="lg" />

            <div className="text-center">
                <p className="text-base font-semibold text-slate-900">{user?.username}</p>
                {user?.email && (
                    <p className="mt-0.5 break-all text-xs text-slate-500">{user.email}</p>
                )}
            </div>

            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Online
                    </span>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="w-full rounded-[10px] border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
            >
                Odjavi se
            </button>
        </div>
    );
}
