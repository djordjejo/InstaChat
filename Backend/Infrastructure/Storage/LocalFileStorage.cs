using Application.Interfaces;

namespace Infrastructure.Storage
{
    /// <summary>
    /// Cuva fajlove na disku, u folderu IZVAN wwwroot-a.
    ///
    /// To je namerno: da su u wwwroot-u, UseStaticFiles bi ih servirao svakome
    /// ko zna URL, bez ikakve provere clanstva u razgovoru. Ovako se do njih
    /// dolazi samo kroz AttachmentController, koji proverava pristup.
    /// </summary>
    public class LocalFileStorage : IFileStorage
    {
        private readonly string _rootPath;

        public LocalFileStorage(string rootPath)
        {
            _rootPath = rootPath;
            Directory.CreateDirectory(_rootPath);
        }

        public async Task<string> SaveAsync(byte[] content, string extension, CancellationToken cancellationToken)
        {
            // Ime generisemo mi. Nista sto je korisnik poslao ne ucestvuje u
            // putanji, pa "../" i slicni trikovi nemaju gde da se ubace.
            var storedName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(_rootPath, storedName);

            await File.WriteAllBytesAsync(fullPath, content, cancellationToken);

            return storedName;
        }

        public Stream? Open(string storedFileName)
        {
            // Pojas i tregeri: i da u bazu nekako dospe ime sa putanjom,
            // GetFileName ga svede na goli naziv.
            var safeName = Path.GetFileName(storedFileName);
            var fullPath = Path.Combine(_rootPath, safeName);

            if (!File.Exists(fullPath)) return null;

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        public void Delete(string storedFileName)
        {
            if (string.IsNullOrWhiteSpace(storedFileName)) return;

            var safeName = Path.GetFileName(storedFileName);
            var fullPath = Path.Combine(_rootPath, safeName);

            // Bez provere File.Exists brisanje vec obrisanog fajla baca izuzetak
            // i obara poziv koji je inace prosao.
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
    }
}
