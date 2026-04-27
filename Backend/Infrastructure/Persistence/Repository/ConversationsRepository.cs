using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace Infrastructure.Persistence.Repository
{
    public class ConversationsRepository : Repository<Conversation>, IConversationRepository
    {
       
        public ConversationsRepository(AppDbContext context) : base(context)
        {
        }

    }
}