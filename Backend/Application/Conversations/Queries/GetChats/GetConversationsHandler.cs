using Application.Common;
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
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ConversationsDto>> Handle(
            GetConversationsQuery query,
            CancellationToken cancellationToken)
        {
            var conversations = await _unitOfWork.ConversationMembers
                .GetConversationsAsync(query.UserId);

            return conversations.Select(x => new ConversationsDto
            {
                ConversationId = x.Id,
                ConversationName = x.DisplayNameFor(query.UserId),
                AvatarUrl = x.AvatarUrlFor(query.UserId),
                IsGroup = x.IsGroup,
                Members = x.Members.Select(member => new MemberDto
                {
                    UserId = member.UserId,
                    Name = member.User.Username,
                    Role = member.Role,
                    IsOnline = member.User.IsOnline,
                    AvatarUrl = AvatarUrls.For(member.UserId, member.User.AvatarUrl),
                }).ToList()
            }).ToList();
        }
    }
}
