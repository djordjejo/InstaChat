using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;

namespace Infrastructure.Persistence.Repository
{
    public class MessageAttachmentsRepository : Repository<MessageAttachment>, IMessageAttachmentRepository
    {
        public MessageAttachmentsRepository(AppDbContext context) : base(context)
        {
        }
    }
}