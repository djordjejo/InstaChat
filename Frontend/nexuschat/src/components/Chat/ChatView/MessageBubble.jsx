export default function MessageBubble({ message, isMyMessage }) {
    return (
        <div className={`flex gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0">
                {message.senderUsername?.slice(0, 2).toUpperCase()}
            </div>
            <div className="max-w-[60%]">
                <p className={`text-[10px] mb-1 text-[#64748b] ${isMyMessage ? "text-right" : "text-left"}`}>
                    {message.senderUsername}
                </p>
                <div className={`px-4 py-2 rounded-2xl text-sm ${isMyMessage ? "bg-[#2563eb] text-white rounded-tr-sm" : "bg-white text-[#1e293b] border border-black/[0.06] rounded-tl-sm"}`}>
                    {message.content}
                </div>
            </div>
        </div>
    );
}
