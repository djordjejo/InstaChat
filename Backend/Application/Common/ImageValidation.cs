namespace Application.Common
{
    /// <summary>
    /// Pravila za slike na jednom mestu - koristi ih i validator i handler.
    /// </summary>
    public static class ImageValidation
    {
        public const long MaxBytes = 5 * 1024 * 1024;   // 5 MB

        /// <summary>
        /// Bela lista tipova i ekstenzija. Ekstenzija se uzima ODAVDE, nikad iz
        /// imena fajla koje je poslao klijent - time otpadaju i "..\..\web.config"
        /// i trikovi tipa "slika.png.exe".
        /// </summary>
        public static readonly IReadOnlyDictionary<string, string> AllowedTypes =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["image/jpeg"] = ".jpg",
                ["image/png"] = ".png",
                ["image/gif"] = ".gif",
                ["image/webp"] = ".webp",
            };

        public static bool IsAllowedContentType(string? contentType) =>
            contentType is not null && AllowedTypes.ContainsKey(contentType);

        public static string ExtensionFor(string contentType) => AllowedTypes[contentType];

        /// <summary>
        /// Obrnut smer: iz ekstenzije sacuvanog fajla natrag u content type.
        /// Kod priloga to nije trebalo (tip se cuva u bazi uz prilog), ali za
        /// avatar se pamti samo ime fajla, pa se tip izvodi iz ekstenzije.
        /// </summary>
        public static string ContentTypeFor(string extension)
        {
            foreach (var pair in AllowedTypes)
            {
                if (string.Equals(pair.Value, extension, StringComparison.OrdinalIgnoreCase))
                    return pair.Key;
            }

            // Nedostizno dok su u bazi samo ekstenzije koje smo mi upisali;
            // stoji da funkcija nikad ne vrati null.
            return "application/octet-stream";
        }

        /// <summary>
        /// Provera POTPISA fajla (magic bytes). Content-Type zaglavlje postavlja
        /// klijent i moze da laze - sadrzaj ne moze. Bez ove provere bi se
        /// izvrsni fajl mogao poslati kao "image/png".
        /// </summary>
        public static bool HasValidSignature(byte[] content, string contentType)
        {
            if (content.Length < 12) return false;

            return contentType.ToLowerInvariant() switch
            {
                // FF D8 FF
                "image/jpeg" => content[0] == 0xFF && content[1] == 0xD8 && content[2] == 0xFF,

                // 89 50 4E 47 0D 0A 1A 0A
                "image/png" => content[0] == 0x89 && content[1] == 0x50 &&
                               content[2] == 0x4E && content[3] == 0x47 &&
                               content[4] == 0x0D && content[5] == 0x0A &&
                               content[6] == 0x1A && content[7] == 0x0A,

                // "GIF87a" ili "GIF89a"
                "image/gif" => content[0] == 0x47 && content[1] == 0x49 && content[2] == 0x46,

                // "RIFF" .... "WEBP"
                "image/webp" => content[0] == 0x52 && content[1] == 0x49 &&
                                content[2] == 0x46 && content[3] == 0x46 &&
                                content[8] == 0x57 && content[9] == 0x45 &&
                                content[10] == 0x42 && content[11] == 0x50,

                _ => false
            };
        }
    }
}
