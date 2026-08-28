import { useAvatarObjectUrl } from "../../hooks/useAvatarObjectUrl";

const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
};

export default function Avatar({ initials, size = "md", avatarUrl = null }) {
    // Nepoznat "size" je ranije davao className="undefined ..." - sada pada na md.
    const dimensions = sizes[size] ?? sizes.md;
    const objectUrl = useAvatarObjectUrl(avatarUrl);

    // Inicijali nisu samo fallback za korisnike bez slike: prikazuju se i dok
    // se slika dovlaci, pa se raspored ne pomera kad stigne.
    if (objectUrl) {
        return (
            <img
                src={objectUrl}
                // Prazan alt namerno: pored avatara uvek stoji ime korisnika,
                // pa bi citac ekrana inace izgovorio isto dvaput.
                alt=""
                className={dimensions + " shrink-0 rounded-[10px] object-cover"}
            />
        );
    }

    return (
        <div
            className={
                dimensions +
                " flex shrink-0 items-center justify-center rounded-[10px] " +
                "bg-blue-100 font-semibold text-blue-700"
            }
        >
            {initials}
        </div>
    );
}
