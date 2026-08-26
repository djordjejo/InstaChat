using Application.Common.Exceptions;
using Application.DTO.Attachment;
using Application.DTO.Messages;
using Application.Interfaces;
using Application.Messages.Command;
using Domain.Interfaces;
using MediatR;

namespace Application.Messages.Handler
{
    public class EditMessageHandler : IRequestHandler<EditMessageCommand, MessageDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotificationService _chatNotificationService;

        public EditMessageHandler(IUnitOfWork unitOfWork, IChatNotificationService chatNotificationService)
        {
            _unitOfWork = unitOfWork;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<MessageDto> Handle(EditMessageCommand command, CancellationToken cancellationToken)
        {
            var message  = await _unitOfWork.Messages.GetByIdAsync(command.MessageId);
            if (message == null || message.IsDeleted == true)
                throw new NotFoundException("Poruka nije pronađena.");

            if (message.SenderId != command.EditorId)
                throw new ForbiddenException("Možete menjati samo svoje poruke."); 
           
            var sender = await _unitOfWork.Users.GetByIdAsync(command.EditorId);

            message.Content = command.Content;
            message.IsEdited = true;

            await _unitOfWork.Messages.UpdateAsync(message);
            await _unitOfWork.Commit(cancellationToken);

            var messageDto = new MessageDto
            {
                MessageId = message.Id,
                ConversationId = message.ConversationId,     
                SenderId = message.SenderId,                 
                Content = message.Content,
                SentAt = DateTime.SpecifyKind(message.SentAt, DateTimeKind.Utc),
                SenderUsername = sender.Username,
                IsEdited = message.IsEdited ?? false,
                // Prilozi se izmenom NE diraju, pa se ovde i ne ucitavaju.
                // Klijent zato spaja izmenu sa porukom koju vec ima: preuzima
                // sadrzaj i oznaku izmene, a svoju listu priloga zadrzava.
                Attachments = new List<AttachmentDto>()
            };

            await _chatNotificationService.MessageUpdatedAsync(message.ConversationId, messageDto);

            return messageDto;
        }
    }
}
