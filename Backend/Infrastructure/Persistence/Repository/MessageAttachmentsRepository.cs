using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repository
{
    public class MessageAttachmentsRepository : Repository<MessageAttachment>, IMessageAttachmentRepository
    {
        private readonly AppDbContext _context;

        public MessageAttachmentsRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<MessageAttachment?> GetWithMessageAsync(Guid attachmentId)
        {
            return await _context.MessageAttachments
                .AsNoTracking()
                .Include(a => a.Message)
                .FirstOrDefaultAsync(a => a.Id == attachmentId);
        }
    }
}
