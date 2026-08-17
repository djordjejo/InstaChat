using Application.DTO.Member;

namespace Application.DTO.Conversation
{
    public class ConversationsDto
    {
        public Guid ConversationId { get; set; }
        public string ConversationName { get; set; } = string.Empty;

        // Bez ovoga frontend ne moze da razlikuje grupu od 1-na-1 razgovora,
        // pa klik na korisnika otvara prvu grupu u kojoj se on nalazi.
        public bool IsGroup { get; set; }

        public IEnumerable<MemberDto>? Members { get; set; }
        public bool UnreadMessage { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
