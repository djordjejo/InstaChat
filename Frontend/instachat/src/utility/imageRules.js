// Ista pravila kao na backendu (ImageValidation.cs). Ovo je samo udobnost za
// korisnika - prava provera je na serveru, jer klijentu se nikad ne veruje.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Vraca poruku o gresci, ili null ako je fajl u redu.
export const validateImage = (file) => {
    if (!file) return "Fajl nije izabran.";

    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        return "Dozvoljene su samo slike: JPG, PNG, GIF, WEBP.";

    if (file.size > MAX_IMAGE_BYTES)
        return "Slika može biti najviše 5 MB.";

    return null;
};
