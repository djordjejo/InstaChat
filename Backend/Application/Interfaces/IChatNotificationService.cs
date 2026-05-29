using Application.DTO.Conversation;
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
        Task AddUsersToConversationGroupAsync(Guid conversationId, IEnumerable<Guid> userIds);
        Task NotifyConversationCreatedAsync(IEnumerable<Guid> userIds, ConversationDto dto);
    }
}
