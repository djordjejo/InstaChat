import { useEffect, useRef, useState } from "react";
import { formatTime } from "../../../utility/formatTime";
import AttachmentImage from "./AttachmentImage";
import { getInitials } from "../../../utility/getInitials";
import Avatar from "../../common/Avatar";

export default function MessageBubble({
    message,
    isMyMessage,
    showMeta,
    avatarUrl,
    onEdit,
    onDelete,
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(message.content ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    // Poruka bez teksta je goli prilog - nema sta da se menja. Brisanje je i
    // tada dozvoljeno, jer uklanja i sam prilog iz razgovora.
    const canEdit = isMyMessage && Boolean(message.content);
    const canDelete = isMyMessage;

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const startEditing = () => {
        setDraft(message.content ?? "");
        setError("");
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setError("");
    };

    const saveEdit = async () => {
        const text = draft.trim();

        // Nepromenjen tekst ne saljemo - to bi poruku obelezilo kao izmenjenu
        // iako se nista nije desilo.
        if (!text || text === message.content) {
            cancelEditing();
            return;
        }

        setBusy(true);
        try {
            await onEdit?.(message.messageId, text);
            setEditing(false);
        } catch (err) {
            setError(err?.message || "Izmena nije uspela.");
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!window.confirm("Obrisati ovu poruku?")) return;

        setBusy(true);
        try {
            await onDelete?.(message.messageId);
        } catch (err) {
            setError(err?.message || "Brisanje nije uspelo.");
            setBusy(false);
        }
    };

    return (
        // "group" drzi dugmad skrivenu dok mis nije nad porukom; focus-within
        // ih otkriva i pri kretanju tastaturom.
        <div
            className={
                "group flex w-full gap-2.5 " +
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

                {editing ? (
                    <div className="w-full rounded-2xl border border-blue-200 bg-white p-2 shadow-sm">
                        <input
                            ref={inputRef}
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            aria-label="Izmeni poruku"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    saveEdit();
                                }
                                if (e.key === "Escape") cancelEditing();
                            }}
                            className="w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white motion-reduce:transition-none"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                onClick={cancelEditing}
                                className="rounded-[10px] px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 motion-reduce:transition-none"
                            >
                                Otkaži
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={busy}
                                className="rounded-[10px] bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 motion-reduce:transition-none"
                            >
                                {busy ? "Čuvam..." : "Sačuvaj"}
                            </button>
                        </div>
                    </div>
                ) : (
                    message.content && (
                        <div
                            className={
                                "flex items-center gap-1 " +
                                (isMyMessage ? "flex-row-reverse" : "flex-row")
                            }
                        >
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

                            {(canEdit || canDelete) && (
                                <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
                                    {canEdit && (
                                        <button
                                            onClick={startEditing}
                                            disabled={busy}
                                            aria-label="Izmeni poruku"
                                            title="Izmeni"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                                            </svg>
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={remove}
                                            disabled={busy}
                                            aria-label="Obriši poruku"
                                            title="Obriši"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* Prilog bez teksta nema balonce uz koji bi dugmad stajala,
                    pa brisanje ide ispod slike. */}
                {!editing && !message.content && canDelete && (
                    <button
                        onClick={remove}
                        disabled={busy}
                        className="mt-1 px-1 text-[10px] font-medium text-slate-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
                    >
                        Obriši
                    </button>
                )}

                {error && (
                    <p className="mt-1 px-1 text-[10px] text-red-600">{error}</p>
                )}

                <p className="mt-1 px-1 text-[10px] tabular-nums text-slate-400">
                    {formatTime(message.sentAt)}
                    {message.isEdited && " · izmenjeno"}
                </p>
            </div>
        </div>
    );
}
