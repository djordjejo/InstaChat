using Application.DTO;
using Application.DTO.Conversation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations.Commands.CreateChat
{
    public class CreateConversationQuery : IRequest<ConversationDto>
    {
        public string? Name { get; set; }        // null za 1-na-1
        public bool IsGroup { get; set; }
        public Guid CreatedById { get; set; }
        public List<Guid> MemberIds { get; set; } = new();
    }
}
