using Application.Conversations.Queries;
using Application.DTO.Conversation;
using Application.DTO.Member;
using Application.DTO.Messages;
using Domain.Interfaces;
using MediatR;


namespace Application.Conversations.Commands
{
    public class GetConversationHandler : IRequestHandler<GetConversationQuery, ConversationDto>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetConversationHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ConversationDto> Handle(GetConversationQuery query, CancellationToken cancellationToken)
        {
            var conversation = await _unitOfWork
             .ConversationMembers
             .GetConversationAsync(query.ConversationId);

            return new ConversationDto
            {
                ConversationId = conversation.Id,
                ConversationName = conversation.Name,
                Messages = conversation.Messages.Select(x => new MessageDto
                {
                    MessageId = x.Id,
                    Content = x.Content,
                    SenderUsername = x.Sender.Username
                }).ToList(),
                Members = conversation.Members.Select(x => new MemberDto
                {
                    UserId = x.UserId,
                    Name = x.User.Username,
                    IsOnline = x.User.IsOnline
                }).ToList(),
            };
        }
    }
}
