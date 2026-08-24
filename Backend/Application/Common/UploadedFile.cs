namespace Application.Common
{
    /// <summary>
    /// Fajl sveden na obicne podatke. Namerno NIJE IFormFile - taj tip dolazi iz
    /// ASP.NET-a, a Application sloj ne sme da zavisi od web frameworka.
    /// Kontroler procita stream u bajtove i preda ovo.
    /// </summary>
    public class UploadedFile
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();

        public long Length => Content.LongLength;
    }
}
