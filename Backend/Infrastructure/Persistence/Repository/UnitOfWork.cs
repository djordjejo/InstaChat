using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Infrastructure.Persistence.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context; 
        public IUserRepository Users { get; set; }
        public IConversationRepository Conversations { get; set; }
        public IMessageRepository Messages { get; set; }
        public IConversationMemberRepository ConversationMembers { get; set; }
        public IMessageAttachmentRepository MessageAttachments { get; set; }

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            Users = new UserRepository(context);
            Conversations = new ConversationsRepository(context);
            Messages = new MessagesRepository(context);
            ConversationMembers = new ConversationMembersRepository(context);
            MessageAttachments = new MessageAttachmentsRepository(context);

        }
            public async Task<int> Commit(CancellationToken cancellation)
            {
            return await _context.SaveChangesAsync(cancellation);
            }
    }
}
