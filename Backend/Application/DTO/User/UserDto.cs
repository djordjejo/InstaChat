namespace Application.DTO.User
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }

        // Vrednost iz baze - koristi se kao POCETNO stanje pri ucitavanju liste.
        // Dalje azuriranje ide uzivo preko SignalR-a (UserOnline / UserOffline),
        // jer je tracker u memoriji uvek svezi od kolone u bazi.
        public bool IsOnline { get; set; }
        public DateTime? LastSeen { get; set; }
    }
}
