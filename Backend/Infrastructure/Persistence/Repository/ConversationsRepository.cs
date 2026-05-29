using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace Infrastructure.Persistence.Repository
{
    public class ConversationsRepository : Repository<Conversation>, IConversationRepository
    {
        private readonly AppDbContext _context;


        public ConversationsRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId)
        {
            return await _context.ConversationMembers
            .Where(cm => cm.UserId == userId)
            .Select(cm => cm.ConversationId)
            .ToListAsync();

        }
    }
}