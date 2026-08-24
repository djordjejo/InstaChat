using Domain.EnumMember;

namespace Application.DTO.Member
{
    public class MemberDto
    {
        public Guid UserId { get; set; }
        public string Name{ get; set; } 
        public MemberRole Role { get; set; } 
        public bool IsOnline { get; set; }

        /// <summary>Adresa endpointa sa slikom, ili null ako je korisnik nema.</summary>
        public string? AvatarUrl { get; set; }
    }
}
