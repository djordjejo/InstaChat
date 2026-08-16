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

        // Svi razgovori u kojima je korisnik clan - koristi ga lista razgovora.
        public async Task<IEnumerable<Conversation>> GetConversationsAsync(Guid userId)
        {
            return await dbContext.ConversationMembers
                .Where(x => x.UserId == userId)
                .Include(c => c.Conversation)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .Select(c => c.Conversation)
                .ToListAsync();
        }

        // Jedan razgovor sa porukama i clanovima - koristi ga otvaranje razgovora.
        //   .Where(IsDeleted != true)  - soft-delete se konacno postuje
        //   .OrderBy(SentAt)           - bez ovoga redosled diktira SQL Server
        //   .ThenInclude(Sender)       - ranije se oslanjalo na EF fixup, pa je
        //                                pucalo cim posiljalac nije bio clan
        public async Task<Conversation> GetConversationAsync(Guid conversationId)
        {
            return await dbContext.Conversations
                .Include(x => x.Messages
                    .Where(m => m.IsDeleted != true)
                    .OrderBy(m => m.SentAt))
                        .ThenInclude(m => m.Sender)
                .Include(x => x.Members)
                    .ThenInclude(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == conversationId);
        }

        // AnyAsync daje SELECT CASE WHEN EXISTS(...) - jedan bit umesto celog
        // reda, i gadja kompozitni primarni kljuc (UserId, ConversationId).
        public async Task<bool> IsMemberAsync(Guid userId, Guid conversationId)
        {
            return await dbContext.ConversationMembers
                .AsNoTracking()
                .AnyAsync(cm => cm.UserId == userId && cm.ConversationId == conversationId);
        }

        // Kad pored clanstva treba i rola (npr. sme li da obrise razgovor).
        public async Task<ConversationMember?> GetMemberAsync(Guid userId, Guid conversationId)
        {
            return await dbContext.ConversationMembers
                .AsNoTracking()
                .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ConversationId == conversationId);
        }

        public async Task<List<Guid>> GetMemberIdsAsync(Guid conversationId)
        {
            return await dbContext.ConversationMembers
                .AsNoTracking()
                .Where(cm => cm.ConversationId == conversationId)
                .Select(cm => cm.UserId)
                .ToListAsync();
        }
    }
}
