using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IConversationRepository : IRepository<Conversation>
    {
        Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId);
    }
}