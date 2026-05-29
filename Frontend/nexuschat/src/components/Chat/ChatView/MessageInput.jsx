import { useTypingIndicator } from "../../../hooks/useTypingIndicator";

export default function MessageInput({ value, onChange, onSend, connection, activeChatId }) {
    const { startTyping, stopTyping } = useTypingIndicator(connection, activeChatId);

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
        if (val.trim().length > 0) {
            startTyping();
        } else {
            stopTyping();
        }
    };

    const handleSend = () => {
        stopTyping();
        onSend(value);
    };

    return (
        <div className="flex items-center gap-3 border-t border-black/[0.06] bg-[#e0effe] px-4 py-3">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Napiši poruku..."
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-[#1e293b] outline-none border border-black/[0.08] focus:border-blue-400"
            />
            <button
                onClick={handleSend}
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