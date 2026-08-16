using Application.Common.Exceptions;
using Application.DTO.Attachment;
using Application.DTO.Messages;
using Application.Messages.Command;
using Domain.Interfaces;
using MediatR;

namespace Application.Messages.Handler
{
    public class EditMessageHandler : IRequestHandler<EditMessageCommand, MessageDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        public EditMessageHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

            return new MessageDto
            {
                MessageId = message.Id,
                ConversationId = message.ConversationId,     
                SenderId = message.SenderId,                 
                Content = message.Content,
                SentAt = DateTime.SpecifyKind(message.SentAt, DateTimeKind.Utc),
                SenderUsername = sender.Username,
                IsEdited = message.IsEdited ?? false,
                Attachments = new List<AttachmentDto>()
            };
        }
    }
}
