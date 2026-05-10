using Application.DTO;
using Application.DTO.Conversation;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations.Queries.GetChats
{
    public class GetConversationQuery : IRequest<ConversationDto>
    {
        public GetConversationQuery(Guid conversationId, Guid userId)
        {
            ConversationId = conversationId;
            CurrentUserId = userId;
        }

        public Guid ConversationId { get; set; }
        public Guid CurrentUserId { get; set; }

        
    }
}
