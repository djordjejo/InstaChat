import { formatTime } from "../../../utility/formatTime";
import AttachmentImage from "./AttachmentImage";
import { getInitials } from "../../../utility/getInitials";
import Avatar from "../../common/Avatar";

export default function MessageBubble({ message, isMyMessage, showMeta, avatarUrl }) {
    return (
        <div
            className={
                "flex w-full gap-2.5 " +
                (isMyMessage ? "flex-row-reverse" : "flex-row")
            }
        >
            {/* Kod uzastopnih poruka istog posiljaoca avatar se ne ponavlja,
                ali prostor ostaje zauzet da se baloncici ne pomeraju. */}
            <div className="w-9 shrink-0">
                {showMeta && (
                    <Avatar
                        initials={getInitials(message.senderUsername)}
                        size="sm"
                        avatarUrl={avatarUrl}
                    />
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

                {/* Prilozi idu IZNAD teksta - slika je glavni sadrzaj, opis je uz nju. */}
                {message.attachments?.length > 0 && (
                    <div className="mb-1 flex flex-col gap-1.5">
                        {message.attachments.map((a) => (
                            <AttachmentImage key={a.attachmentId} attachment={a} />
                        ))}
                    </div>
                )}

                {message.content && (
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
                )}

                <p className="mt-1 px-1 text-[10px] tabular-nums text-slate-400">
                    {formatTime(message.sentAt)}
                    {message.isEdited && " · izmenjeno"}
                </p>
            </div>
        </div>
    );
}
