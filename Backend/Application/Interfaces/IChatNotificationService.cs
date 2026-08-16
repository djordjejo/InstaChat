using Application.DTO.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IChatNotificationService
    {
        Task SendMessageAsync(Guid conversationId, MessageDto message);
        Task ConversationCreatedAsync(Guid conversationId, IEnumerable<Guid> memberIds);
        Task ConversationDeletedAsync(Guid conversationId, IEnumerable<Guid> memberIds);

    }
}
