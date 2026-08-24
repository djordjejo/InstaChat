using Application.Common;
using Application.Common.Exceptions;
using Application.DTO.Attachment;
using Application.DTO.Messages;
using Application.Interfaces;
using Application.Messages.Command;
using Domain.Entities;
using Domain.EnumMember;
using Domain.Interfaces;
using MediatR;

namespace Application.Messages.Handler
{
    public class SendImageMessageHandler : IRequestHandler<SendImageMessageCommand, MessageDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotificationService _chatNotificationService;
        private readonly IFileStorage _fileStorage;

        public SendImageMessageHandler(
            IUnitOfWork unitOfWork,
            IChatNotificationService chatNotificationService,
            IFileStorage fileStorage)
        {
            _unitOfWork = unitOfWork;
            _chatNotificationService = chatNotificationService;
            _fileStorage = fileStorage;
        }

        public async Task<MessageDto> Handle(SendImageMessageCommand command, CancellationToken cancellationToken)
        {
            if (!await _unitOfWork.ConversationMembers
                    .IsMemberAsync(command.SenderId, command.ConversationId))
                throw new ForbiddenException("Niste član ovog razgovora.");

            // Ekstenzija se izvodi iz PROVERENOG content type-a, ne iz imena
            // fajla koje je poslao klijent.
            var extension = ImageValidation.ExtensionFor(command.File.ContentType);
            var storedName = await _fileStorage.SaveAsync(
                command.File.Content, extension, cancellationToken);

            var message = new Message
            {
                ConversationId = command.ConversationId,
                SenderId = command.SenderId,
                Content = command.Content ?? string.Empty,
                SentAt = DateTime.UtcNow,
                IsEdited = false,
                IsDeleted = false
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.Commit(cancellationToken);

            var attachment = new MessageAttachment
            {
                MessageId = message.Id,
                // Originalno ime cuvamo samo za prikaz i preuzimanje. Putanja na
                // disku je "storedName" - nasa, generisana, bez ikakvog uticaja
                // korisnika.
                FileName = Path.GetFileName(command.File.FileName),
                FileUrl = storedName,
                FileSize = command.File.Length,
                ContentType = command.File.ContentType,
                AttachmentType = AttachmentType.Image,
                UploadedAt = DateTime.UtcNow
            };

            await _unitOfWork.MessageAttachments.AddAsync(attachment);
            await _unitOfWork.Commit(cancellationToken);

            var sender = await _unitOfWork.Users.GetByIdAsync(command.SenderId);

            var messageDto = new MessageDto
            {
                MessageId = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                SentAt = DateTime.SpecifyKind(message.SentAt, DateTimeKind.Utc),
                SenderUsername = sender?.Username ?? "Unknown",
                IsEdited = false,
                Attachments = new List<AttachmentDto>
                {
                    new()
                    {
                        AttachmentId = attachment.Id,
                        FileName = attachment.FileName,
                        // NE putanja na disku - adresa autorizovanog endpointa.
                        FileUrl = $"/attachment/{attachment.Id}",
                        FileSize = attachment.FileSize,
                        ContentType = attachment.ContentType,
                        UploadedAt = attachment.UploadedAt
                    }
                }
            };

            await _chatNotificationService.SendMessageAsync(command.ConversationId, messageDto);

            return messageDto;
        }
    }
}
