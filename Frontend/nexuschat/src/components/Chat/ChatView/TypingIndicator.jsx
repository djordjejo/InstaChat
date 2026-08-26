// Prolazno stanje interfejsa - nista se ne cuva u bazi, prikaz zivi samo dok
// traju dogadjaji UserTyping / UserStopTyping sa cvorista.
export default function TypingIndicator({ names }) {
    if (!names || names.length === 0) return null;

    // U grupi lako kuca vise ljudi odjednom; nabrajanje svih imena bi razvuklo
    // traku, pa se od tri naviše prelazi na zbirnu formulaciju.
    const label =
        names.length === 1
            ? `${names[0]} kuca...`
            : names.length === 2
              ? `${names[0]} i ${names[1]} kucaju...`
              : "Više osoba kuca...";

    return (
        <div
            // aria-live: citac ekrana javi da sagovornik pise, ali "polite" -
            // ne prekida ono sto korisnik trenutno slusa.
            aria-live="polite"
            className="flex items-center gap-2 bg-slate-50 px-4 pb-1 pt-1 text-xs text-slate-500 md:px-6"
        >
            <span className="flex gap-0.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none" />
            </span>
            {label}
        </div>
    );
}
