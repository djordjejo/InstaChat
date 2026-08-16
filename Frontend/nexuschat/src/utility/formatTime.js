// Intl formateri se prave jednom, na nivou modula. Pravljenje u svakom renderu
// baloncica je merljivo sporije kod dugih razgovora.
const timeFormatter = new Intl.DateTimeFormat("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("sr-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatTime = (value) => {
    const date = toDate(value);
    return date ? timeFormatter.format(date) : "";
};

export const isSameDay = (a, b) => {
    const d1 = toDate(a);
    const d2 = toDate(b);
    if (!d1 || !d2) return false;

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const formatDayLabel = (value) => {
    const date = toDate(value);
    if (!date) return "";

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(date, now)) return "Danas";
    if (isSameDay(date, yesterday)) return "Juče";

    return dateFormatter.format(date);
};
