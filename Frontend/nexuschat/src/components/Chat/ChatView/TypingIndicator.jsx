export default function TypingIndicator({ usernames }) {
    if (!usernames || usernames.length === 0) return null;

    const text = usernames.length === 1
        ? `${usernames[0]} kuca`
        : `${usernames.slice(0, -1).join(", ")} i ${usernames[usernames.length - 1]} kucaju`;

    return (
        <div className="flex items-center gap-2 px-5 py-2 text-xs italic text-[#64748b]">
            <span>{text}</span>
            <span className="flex gap-1">
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "0ms" }}
                />
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "150ms" }}
                />
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "300ms" }}
                />
            </span>
        </div>
    );
}