using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations.Commands.DeleteChat
{
    public class DeleteConversationCommand : IRequest<Unit>
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }

        public DeleteConversationCommand(Guid conversationId, Guid userId)
        {
            ConversationId = conversationId;
            UserId = userId;
        }
    }
}
