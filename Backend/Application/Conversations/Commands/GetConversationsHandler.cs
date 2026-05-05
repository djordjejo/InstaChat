using Application.Conversations.Queries;
using Application.DTO.Conversation;
using Application.DTO.Member;
using Domain.Interfaces;
using MediatR;

namespace Application.Conversations.Commands
{
    public class GetConversationsHandler : IRequestHandler<GetConversationsQuery, List<ConversationsDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetConversationsHandler(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }

        public async Task<List<ConversationsDto>> Handle(GetConversationsQuery query, CancellationToken cancellationToken)
        {

            var conversations = await _unitOfWork.ConversationMembers.GetConversationsAsync(query.UserId);

            var result = conversations.Select(x => new ConversationsDto
            {
                ConversationsId = x.Id,
                ConversationName = x.Name,
                Members = x.Members.Select(member => new MemberDto { 
                    UserId = member.Id,
                    Name = member.User.Username,
                    IsOnline = member.User.IsOnline,
                })

            }).ToList();

            return result;
        }


    }
}
