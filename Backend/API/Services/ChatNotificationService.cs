using API.Hubs;
using Application.DTO.Conversation;
using Application.DTO.Messages;
using Application.Interfaces;
using Domain.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace API.Services
{
    public class ChatNotificationService : IChatNotificationService
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IOnlineUserTracker _onlineTracker;   

        public ChatNotificationService(
            IHubContext<ChatHub> hubContext,
            IOnlineUserTracker onlineTracker)                 
        {
            _hubContext = hubContext;
            _onlineTracker = onlineTracker;
        }

        public async Task SendMessageAsync(Guid conversationId, MessageDto message)
        {
            await _hubContext.Clients
                .Group(conversationId.ToString())
                .SendAsync("ReceiveMessage", message);
        }

        public async Task AddUsersToConversationGroupAsync(
            Guid conversationId,
            IEnumerable<Guid> userIds)
        {
            var groupName = conversationId.ToString();

            foreach (var userId in userIds)
            {
                var connectionIds = _onlineTracker.GetConnectionIdsForUser(userId);
                foreach (var connectionId in connectionIds)
                {
                    await _hubContext.Groups.AddToGroupAsync(connectionId, groupName);
                }
            }
        }

        public async Task NotifyConversationCreatedAsync(IEnumerable<Guid> userIds, ConversationDto dto)
        {
            foreach (var userID in userIds)
            { 
                var connectionIds = _onlineTracker.GetConnectionIdsForUser(userID);
                foreach(var connectionId in connectionIds)
                {
                   await _hubContext.Clients.Client(connectionId).SendAsync("ConversationCreated", dto);
                }
            }
        }
    }
}
