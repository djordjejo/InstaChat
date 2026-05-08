export default function MessageInput({ value, onChange, onSend }) {
    return (
        <div className="flex items-center gap-3 border-t border-black/[0.06] bg-[#e0effe] px-4 py-3">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Napiši poruku..."
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend(value);
                    }
                }}
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-[#1e293b] outline-none border border-black/[0.08] focus:border-blue-400"
            />
            <button
                onClick={() => onSend(value)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] transition"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </div>
    );
}
