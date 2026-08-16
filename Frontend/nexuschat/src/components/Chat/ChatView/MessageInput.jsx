export default function MessageInput({ value, onChange, onSend }) {
    const canSend = value.trim().length > 0;

    const handleSend = () => {
        if (!canSend) return;
        onSend(value);
    };

    return (
        <div className="flex items-center gap-2.5 border-t border-slate-200 bg-white px-4 py-3 md:px-6">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Napiši poruku..."
                aria-label="Poruka"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 motion-reduce:transition-none"
            />
            <button
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Pošalji poruku"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
            >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </div>
    );
}
