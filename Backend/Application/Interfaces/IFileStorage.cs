namespace Application.Interfaces
{
    /// <summary>
    /// Apstrakcija nad skladistem fajlova. Application sloj ne sme da zna da li
    /// je to disk, S3 ili Azure Blob - zna samo da negde upisuje bajtove i
    /// dobija natrag ime pod kojim su sacuvani.
    /// </summary>
    public interface IFileStorage
    {
        /// <summary>Upisuje sadrzaj i vraca generisano ime fajla u skladistu.</summary>
        Task<string> SaveAsync(byte[] content, string extension, CancellationToken cancellationToken);

        /// <summary>Stream za citanje, ili null ako fajl ne postoji.</summary>
        Stream? Open(string storedFileName);
    }
}
