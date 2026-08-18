import { formatTime } from "../../../utility/formatTime";
import { getInitials } from "../../../utility/getInitials";

export default function MessageBubble({ message, isMyMessage, showMeta }) {
    return (
        <div
            className={
                "flex w-full gap-2.5 " +
                (isMyMessage ? "flex-row-reverse" : "flex-row")
            }
        >
            {/* Kod uzastopnih poruka istog posiljaoca avatar se ne ponavlja,
                ali prostor ostaje zauzet da se baloncici ne pomeraju. */}
            <div className="w-8 shrink-0">
                {showMeta && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-blue-100 text-[10px] font-semibold text-blue-700">
                        {getInitials(message.senderUsername)}
                    </div>
                )}
            </div>

            <div
                className={
                    "flex min-w-0 max-w-[min(78%,34rem)] flex-col " +
                    (isMyMessage ? "items-end" : "items-start")
                }
            >
                {showMeta && !isMyMessage && (
                    <p className="mb-1 px-1 text-[11px] font-medium text-slate-500">
                        {message.senderUsername}
                    </p>
                )}

                <div
                    className={
                        "whitespace-pre-wrap break-words px-3.5 py-2 text-sm leading-relaxed " +
                        (isMyMessage
                            ? "rounded-2xl rounded-br-md bg-blue-600 text-white"
                            : "rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm")
                    }
                >
                    {message.content}
                </div>

                <p className="mt-1 px-1 text-[10px] tabular-nums text-slate-400">
                    {formatTime(message.sentAt)}
                    {message.isEdited && " · izmenjeno"}
                </p>
            </div>
        </div>
    );
}
