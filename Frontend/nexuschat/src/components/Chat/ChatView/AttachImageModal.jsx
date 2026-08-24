import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function AttachImageModal({ onClose, onSend }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);

    // Isti limiti kao na backendu. Ovo je samo udobnost za korisnika - prava
    // provera je na serveru, jer klijentu se nikad ne veruje.
    const pickFile = (selected) => {
        setError("");

        if (!selected) return;

        if (!ALLOWED.includes(selected.type)) {
            setError("Dozvoljene su samo slike: JPG, PNG, GIF, WEBP.");
            return;
        }
        if (selected.size > MAX_BYTES) {
            setError("Slika može biti najviše 5 MB.");
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    useEffect(() => {
        const onEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [onClose]);

    const handleSend = async () => {
        if (!file || sending) return;

        setSending(true);
        try {
            await onSend(file, caption.trim());
        } catch (err) {
            setError(err?.message || "Slanje nije uspelo.");
            setSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Dodaj sliku"
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-base font-semibold text-slate-900">Dodaj sliku</h2>

                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED.join(",")}
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                />

                {preview ? (
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="mb-4 block w-full overflow-hidden rounded-xl border border-slate-200"
                    >
                        <img src={preview} alt="Pregled" className="max-h-56 w-full object-contain bg-slate-50" />
                    </button>
                ) : (
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="mb-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-500 motion-reduce:transition-none"
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                        <span className="text-xs font-medium">Izaberi sliku</span>
                        <span className="text-[10px]">JPG, PNG, GIF, WEBP · do 5 MB</span>
                    </button>
                )}

                <input
                    type="text"
                    placeholder="Opis (opciono)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    aria-label="Opis slike"
                    className="mb-4 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 motion-reduce:transition-none"
                />

                {error && (
                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-[10px] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 motion-reduce:transition-none"
                    >
                        Otkaži
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!file || sending}
                        className="flex-1 rounded-[10px] bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 motion-reduce:transition-none"
                    >
                        {sending ? "Šaljem..." : "Pošalji"}
                    </button>
                </div>
            </div>
        </div>
    );
}
