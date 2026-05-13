import { useState } from "react";
import Avatar from "../../common/Avatar";

export default function CreateGroupModal({ onlineUsers, onClose, onCreate }) {
    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const toggleUser = (userId) => {
        setSelectedUserIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const canCreate = groupName.trim().length > 0 && selectedUserIds.size > 0;

    const handleSubmit = () => {
        if (!canCreate) return;
        onCreate({
            name: groupName.trim(),
            memberIds: Array.from(selectedUserIds)
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={onClose}
        >
            <div
                className="w-96 rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-lg font-semibold text-[#1e293b]">Nova grupa</h2>

                <input
                    type="text"
                    placeholder="Naziv grupe"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />

                <p className="mb-2 text-xs font-medium text-[#64748b]">
                    Članovi ({selectedUserIds.size})
                </p>

                <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-black/10">
                    {onlineUsers.length === 0 ? (
                        <p className="p-3 text-center text-xs text-[#94a3b8]">
                            Nema online korisnika
                        </p>
                    ) : (
                        onlineUsers.map(u => {
                            const isSelected = selectedUserIds.has(u.userId);
                            return (
                                <button
                                    key={u.userId}
                                    onClick={() => toggleUser(u.userId)}
                                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                                        isSelected ? "bg-blue-50" : "hover:bg-black/5"
                                    }`}
                                >
                                    <Avatar initials={u.username?.slice(0, 2).toUpperCase()} size="sm" />
                                    <span className="flex-1 text-sm text-[#1e293b]">{u.username}</span>
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600">
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
                        className="flex-1 rounded-lg border border-black/10 px-4 py-2 text-sm text-[#64748b] transition hover:bg-black/5"
                    >
                        Otkaži
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canCreate}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        Kreiraj grupu
                    </button>
                </div>
            </div>
        </div>
    );
}