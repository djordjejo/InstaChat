import { useState } from "react";
import Avatar from "../../common/Avatar";

export default function CreateGroupModal({ users, onlineIds, onClose, onCreate }) {
    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);

    const toggleUser = (userId) => {
        setSelectedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const canCreate =
        groupName.trim().length > 0 && selectedUserIds.size > 0 && !submitting;

    // Bez "submitting" zastavice dupli klik pravi dve identicne grupe.
    const handleSubmit = async () => {
        if (!canCreate) return;
        setSubmitting(true);
        try {
            await onCreate({
                name: groupName.trim(),
                memberIds: Array.from(selectedUserIds),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Nova grupa"
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-base font-semibold text-slate-900">Nova grupa</h2>

                <input
                    type="text"
                    placeholder="Naziv grupe"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    aria-label="Naziv grupe"
                    className="mb-4 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 motion-reduce:transition-none"
                />

                <p className="mb-2 text-xs font-medium text-slate-500">
                    Članovi ({selectedUserIds.size})
                </p>

                <div className="mb-4 max-h-60 overflow-y-auto rounded-[10px] border border-slate-200">
                    {users.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-400">
                            Nema drugih korisnika
                        </p>
                    ) : (
                        users.map((u) => {
                            const isSelected = selectedUserIds.has(u.userId);
                            const isOnline = onlineIds.has(u.userId?.toLowerCase());
                            return (
                                <button
                                    key={u.userId}
                                    onClick={() => toggleUser(u.userId)}
                                    aria-pressed={isSelected}
                                    className={
                                        "flex w-full items-center gap-3 px-3 py-2 text-left transition motion-reduce:transition-none " +
                                        (isSelected ? "bg-blue-50" : "hover:bg-slate-50")
                                    }
                                >
                                    <span className="relative">
                                        <Avatar
                                            initials={u.username?.slice(0, 2).toUpperCase()}
                                            size="xs"
                                        />
                                        <span
                                            className={
                                                "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white " +
                                                (isOnline ? "bg-emerald-500" : "bg-slate-300")
                                            }
                                        />
                                    </span>
                                    <span className="flex-1 truncate text-sm text-slate-800">
                                        {u.username}
                                    </span>
                                    {isSelected && (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600" aria-hidden="true">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-[10px] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 motion-reduce:transition-none"
                    >
                        Otkaži
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canCreate}
                        className="flex-1 rounded-[10px] bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 motion-reduce:transition-none"
                    >
                        {submitting ? "Kreiram..." : "Kreiraj grupu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
