// Backend vraca greske u tri oblika, zavisno od toga sta je poslo naopako:
//
//   ProblemDetails            { title, detail }              - 401/403/404/409
//   ValidationProblemDetails  { title, errors: { Polje: [] } } - 400
//   goli string                                              - retko, stariji putevi
//
// Bez ovog svodjenja, komponenta bi u setError dobila objekat i React bi bacio
// "Objects are not valid as a React child".
export const getErrorMessage = (err, fallback = "Došlo je do greške.") => {
    const data = err?.response?.data;

    if (!data) return err?.message || fallback;
    if (typeof data === "string") return data;

    // Kod validacije prikazujemo PRVU poruku - forma ionako ima jedno mesto za
    // gresku, a korisnik ih resava jednu po jednu.
    if (data.errors && typeof data.errors === "object") {
        const first = Object.values(data.errors).flat().find(Boolean);
        if (first) return first;
    }

    return data.detail || data.title || fallback;
};
