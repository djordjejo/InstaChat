namespace Application.Common
{
    /// <summary>
    /// Na jednom mestu se pravi adresa avatara koju vidi frontend.
    ///
    /// U bazi (User.AvatarUrl) stoji IME FAJLA na disku - ono se nikad ne
    /// salje klijentu, isto kao kod priloga. Napolje ide adresa autorizovanog
    /// endpointa.
    /// </summary>
    public static class AvatarUrls
    {
        public static string? For(Guid userId, string? storedFileName)
        {
            if (string.IsNullOrWhiteSpace(storedFileName))
                return null;

            // "?v=" nije ukras: adresa avatara je inace ista posle svake izmene
            // slike, pa bi klijent (i browser kes) prikazivao staru. Novo ime
            // fajla daje novo "v", a time i novi URL.
            var stamp = Path.GetFileNameWithoutExtension(storedFileName);
            if (stamp.Length > 8) stamp = stamp[..8];

            return $"/user/{userId}/avatar?v={stamp}";
        }
    }
}
