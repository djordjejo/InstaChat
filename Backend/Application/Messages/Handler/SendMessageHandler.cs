using Application.DTO.Attachment;
using Application.DTO.Messages;
using Application.Interfaces;
using Application.Messages.Command;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Messages.Handler
{
    public class SendMessageHandler : IRequestHandler<SendMessageCommand, MessageDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotificationService _chatNotificationService;

        public SendMessageHandler(IUnitOfWork unitOfWork, IChatNotificationService chatNotificationService)
        {
            _unitOfWork = unitOfWork;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<MessageDto> Handle(SendMessageCommand command, CancellationToken cancellationToken)
        {
            var conversation = await _unitOfWork.Conversations.GetByIdAsync(command.ConversationId);
            if (conversation == null)
                throw new Exception("Konverzacija ne postoji");

            var message = new Message
            {
                ConversationId = command.ConversationId,
                SenderId = command.SenderId,
                Content = command.Content,
                SentAt = DateTime.UtcNow,
                IsEdited = false,
                IsDeleted = false
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.Commit(cancellationToken);

            var sender = await _unitOfWork.Users.GetByIdAsync(command.SenderId);

            var messageDto = new MessageDto
            {
                MessageId = message.Id,
                Content = message.Content,
                SentAt = message.SentAt,
                SenderUsername = sender?.Username ?? "Unknown",
                IsEdited = message.IsEdited.Value,
                Attachments = new List<AttachmentDto>()
            };
            await _chatNotificationService.SendMessageAsync(
                    command.ConversationId, messageDto);

            return messageDto;
        }
    }
}
