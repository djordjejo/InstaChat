using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repository
{
    public class MessagesRepository : Repository<Message>, IMessageRepository
    {
        private readonly AppDbContext _context;

        public MessagesRepository(AppDbContext context ) : base (context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId, int page, int pageSize)
        {
            if (conversationId == Guid.Empty)
                return Enumerable.Empty<Message>();

            var messages = await _context.Messages.Where(x => x.ConversationId == conversationId)
            .OrderByDescending(x => x.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Sender)
            .Include(x => x.Attachments)
            .ToListAsync();

            return messages;
        }

    }
}