import { useRef, useState } from "react";
import Avatar from "../../common/Avatar";
import { useAuth } from "../../../context/AuthContext";
import { uploadAvatar, deleteAvatar } from "../../../api/userApi";
import { ALLOWED_IMAGE_TYPES, validateImage } from "../../../utility/imageRules";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export default function ProfilePanel({ initials, avatarUrl, onAvatarChange, onLogout }) {
    const { user } = useAuth();
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const pickFile = async (selected) => {
        setError("");
        if (!selected) return;

        const problem = validateImage(selected);
        if (problem) {
            setError(problem);
            return;
        }

        setBusy(true);
        try {
            const updated = await uploadAvatar(selected);
            onAvatarChange?.(updated);
        } catch (err) {
            setError(getErrorMessage(err, "Postavljanje slike nije uspelo."));
        } finally {
            setBusy(false);
            // Bez ovoga izbor ISTOG fajla drugi put ne okida "change", pa posle
            // neuspelog pokusaja korisnik ne moze da ponovi istu sliku.
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const removeAvatar = async () => {
        setError("");
        setBusy(true);
        try {
            const updated = await deleteAvatar();
            onAvatarChange?.(updated);
        } catch (err) {
            setError(getErrorMessage(err, "Uklanjanje slike nije uspelo."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
                <Avatar initials={initials} size="lg" avatarUrl={avatarUrl} />

                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    aria-label={avatarUrl ? "Promeni profilnu sliku" : "Dodaj profilnu sliku"}
                    title={avatarUrl ? "Promeni sliku" : "Dodaj sliku"}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
            />

            <div className="text-center">
                <p className="text-base font-semibold text-slate-900">{user?.username}</p>
                {user?.email && (
                    <p className="mt-0.5 break-all text-xs text-slate-500">{user.email}</p>
                )}
            </div>

            <div className="flex w-full flex-col items-center gap-1">
                <p className="text-[10px] text-slate-400">JPG, PNG, GIF, WEBP · do 5 MB</p>

                {avatarUrl && (
                    <button
                        onClick={removeAvatar}
                        disabled={busy}
                        className="text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
                    >
                        Ukloni sliku
                    </button>
                )}
            </div>

            {busy && <p className="text-xs text-slate-400">Čuvam...</p>}

            {error && (
                <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
                    {error}
                </p>
            )}

            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Online
                    </span>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="w-full rounded-[10px] border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
            >
                Odjavi se
            </button>
        </div>
    );
}
