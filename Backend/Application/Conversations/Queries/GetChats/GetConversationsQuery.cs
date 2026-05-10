using Application.DTO.Conversation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations.Queries.GetChats
{
    public class GetConversationsQuery : IRequest<List<ConversationsDto>>
    {
       public Guid UserId { get; set; }

        public GetConversationsQuery(Guid userId)
        {
            UserId = userId;
        }
    }
}
