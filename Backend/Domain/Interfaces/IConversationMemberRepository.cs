using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IConversationMemberRepository : IRepository<ConversationMember>
    {
        // --- citanje razgovora ---
        Task<IEnumerable<Conversation>> GetConversationsAsync(Guid userId);
        Task<Conversation> GetConversationAsync(Guid conversationId);

        // --- provere clanstva ---
        Task<bool> IsMemberAsync(Guid userId, Guid conversationId);
        Task<ConversationMember?> GetMemberAsync(Guid userId, Guid conversationId);
        Task<List<Guid>> GetMemberIdsAsync(Guid conversationId);
    }
}
