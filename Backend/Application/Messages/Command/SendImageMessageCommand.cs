using Application.Common;
using Application.DTO.Messages;
using MediatR;

namespace Application.Messages.Command
{
    public class SendImageMessageCommand : IRequest<MessageDto>
    {
        public Guid SenderId { get; set; }
        public Guid ConversationId { get; set; }

        /// <summary>Opcioni tekst uz sliku.</summary>
        public string? Content { get; set; }

        public UploadedFile File { get; set; } = new();
    }
}
