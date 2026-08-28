import { useEffect, useState } from "react";
import { fetchAttachmentBlob } from "../../../api/attachmentApi";

export default function AttachmentImage({ attachment }) {
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let objectUrl = null;
        let cancelled = false;

        const load = async () => {
            try {
                const blob = await fetchAttachmentBlob(attachment.attachmentId);
                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
            } catch {
                if (!cancelled) setFailed(true);
            }
        };

        load();

        return () => {
            cancelled = true;
            // Bez revokeObjectURL blob ostaje u memoriji do reload-a stranice.
            // Kod razgovora sa mnogo slika to se brzo nakupi.
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [attachment.attachmentId]);

    if (failed) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
                Slika nije dostupna
            </div>
        );
    }

    if (!url) {
        return (
            <div className="h-40 w-56 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        );
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className="block">
            <img
                src={url}
                alt={attachment.fileName || "Slika"}
                className="max-h-72 w-auto max-w-full rounded-xl border border-slate-200 object-cover"
            />
        </a>
    );
}
