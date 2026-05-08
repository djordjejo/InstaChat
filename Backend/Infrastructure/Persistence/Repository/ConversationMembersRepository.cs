using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repository
{
    public class ConversationMembersRepository : Repository<ConversationMember>, IConversationMemberRepository
    {
        private readonly AppDbContext dbContext;

        public ConversationMembersRepository(AppDbContext context) : base(context)
        {
            dbContext = context;
        }

        public async Task<IEnumerable<Conversation>> GetConversationsAsync(Guid id)
        {
            var result = await dbContext.ConversationMembers
                .Where(x => x.UserId.Equals(id))
                .Include(c => c.Conversation)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .Select(c => c.Conversation)
                .ToListAsync();
            return result;
        }

        public async Task<Conversation> GetConversationAsync(Guid id)
        {
            return await  dbContext.Conversations
                        .Include(x => x.Messages)
                        .Include(x => x.Members)
                            .ThenInclude(x => x.User)
                        .FirstOrDefaultAsync(x => x.Id == id);
        }
       
    }
}