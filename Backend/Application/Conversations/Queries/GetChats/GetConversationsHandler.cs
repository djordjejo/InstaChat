using Application.DTO.Conversation;
using Application.DTO.Member;
using Domain.Interfaces;
using MediatR;

namespace Application.Conversations.Queries.GetChats
{
    public class GetConversationsHandler : IRequestHandler<GetConversationsQuery, List<ConversationsDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetConversationsHandler(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }

        public async Task<List<ConversationsDto>> Handle(
         GetConversationsQuery query,
         CancellationToken cancellationToken)
        {
            var conversations = await _unitOfWork.ConversationMembers
                .GetConversationsAsync(query.UserId);

            var result = conversations.Select(x => new ConversationsDto
            {
                ConversationId = x.Id,
                ConversationName = x.IsGroup
                    ? x.Name
                    : x.Members.First(m => m.UserId != query.UserId).User.Username,
                Members = x.Members.Select(member => new MemberDto
                {
                    UserId = member.UserId,         
                    Name = member.User.Username,
                    IsOnline = member.User.IsOnline,
                }


                ).ToList()
            }).ToList();

            return result;
        }

    }
}
