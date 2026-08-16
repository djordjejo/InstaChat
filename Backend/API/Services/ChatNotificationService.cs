using API.Hubs;
using Application.DTO.Messages;
using Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace API.Services
{
    public class ChatNotificationService : IChatNotificationService
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<ChatNotificationService> _logger;

        public ChatNotificationService(
            IHubContext<ChatHub> hubContext,
            ILogger<ChatNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendMessageAsync(Guid conversationId, MessageDto message)
        {
            await _hubContext.Clients
                .Group(conversationId.ToString())
                .SendAsync("ReceiveMessage", message);
        }

        public async Task ConversationCreatedAsync(Guid conversationId, IEnumerable<Guid> memberIds)
        {
            var userIds = memberIds.Select(id => id.ToString()).ToList();

            await _hubContext.Clients
                .Users(userIds)
                .SendAsync("ConversationCreated", conversationId);

            _logger.LogInformation(
                "Razgovor {ConversationId} kreiran, obavešteno {Count} članova",
                conversationId, userIds.Count);
        }
        public async Task ConversationDeletedAsync(Guid conversationId, IEnumerable<Guid> memberIds)
        {
            var userIds = memberIds.Select(id => id.ToString()).ToList();

            await _hubContext.Clients
                .Users(userIds)
                .SendAsync("ConversationDeleted", conversationId);

            _logger.LogInformation(
                "Razgovor {ConversationId} obrisan, obavešteno {Count} članova",
                conversationId, userIds.Count);
        }
    }
}