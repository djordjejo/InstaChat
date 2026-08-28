import { useEffect, useState } from "react";
import { fetchAvatarBlob } from "../api/userApi";

// Kes je MODULARNI, ne po komponenti: isti korisnik se pojavljuje u listi
// razgovora, u listi korisnika i na svakoj svojoj poruci. Bez ovoga bi svaki
// od tih avatara bio zaseban HTTP poziv, pa bi otvaranje razgovora znacilo
// desetine zahteva za istu sliku.
//
// Kljuc je bas adresa sa "?v=" koju vraca backend - promena slike menja "v",
// pa se stari unos vise ne moze pogoditi.
const cache = new Map();     // avatarUrl -> objectURL | null (null = nema slike)
const inFlight = new Map();  // avatarUrl -> Promise

// objectURL se NAMERNO ne oslobadja pri unmount-u komponente: isti URL deli
// vise Avatar-a, pa bi revoke jednog pokvario sve ostale. Zato ovo - poziva se
// kad se zna da adresa vise nije u upotrebi (korisnik je promenio svoju sliku).
export const forgetAvatar = (avatarUrl) => {
    if (!avatarUrl) return;

    const objectUrl = cache.get(avatarUrl);
    if (objectUrl) URL.revokeObjectURL(objectUrl);

    cache.delete(avatarUrl);
    inFlight.delete(avatarUrl);
};

export function useAvatarObjectUrl(avatarUrl) {
    // Kesirana slika se vraca vec pri RENDERU. Da se to radilo kroz setState u
    // efektu, svaki avatar bi izazvao jos jedan prolaz kroz render.
    const cached = avatarUrl ? cache.get(avatarUrl) ?? null : null;

    // Uz vrednost se pamti i adresa za koju je dobijena - inace bi se posle
    // promene slike stara jos jedan render prikazivala pod novom adresom.
    const [fetched, setFetched] = useState({ url: null, objectUrl: null });

    useEffect(() => {
        if (!avatarUrl || cache.has(avatarUrl)) return;

        let cancelled = false;

        let pending = inFlight.get(avatarUrl);
        if (!pending) {
            pending = fetchAvatarBlob(avatarUrl)
                .then((blob) => URL.createObjectURL(blob))
                // 404 znaci da korisnik nema sliku - upisujemo null u kes, da se
                // za istog korisnika ne pokusava iznova pri svakom renderu.
                .catch(() => null)
                .then((objectUrl) => {
                    cache.set(avatarUrl, objectUrl);
                    inFlight.delete(avatarUrl);
                    return objectUrl;
                });

            inFlight.set(avatarUrl, pending);
        }

        pending.then((objectUrl) => {
            if (!cancelled) setFetched({ url: avatarUrl, objectUrl });
        });

        return () => {
            cancelled = true;
        };
    }, [avatarUrl]);

    if (cached) return cached;

    return fetched.url === avatarUrl ? fetched.objectUrl : null;
}
