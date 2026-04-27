
using MediatR;
using Application.DTO.Messages;

namespace Application.Messages.Command
{
    public class SendMessageCommand : IRequest<MessageDto>
    {
        public Guid SenderId { get; set; }
        public Guid ConversationId { get; set; }
        public string Content { get; set; }
    }
}
