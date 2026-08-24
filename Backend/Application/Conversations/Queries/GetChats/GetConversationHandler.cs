using Application.Common;
using Application.Common.Exceptions;
using Application.DTO.Attachment;
using Application.DTO.Conversation;
using Application.DTO.Member;
using Application.DTO.Messages;
using Domain.Interfaces;
using MediatR;

namespace Application.Conversations.Queries.GetChats
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
            if (!await _unitOfWork.ConversationMembers.IsMemberAsync(query.CurrentUserId, query.ConversationId))
                throw new ForbiddenException("Nemate pristup ovom razgovoru.");

            var conversation = await _unitOfWork.ConversationMembers.GetConversationAsync(query.ConversationId);

            if (conversation == null)
                throw new NotFoundException("Razgovor nije pronađen.");

            return new ConversationDto
            {
                ConversationId = conversation.Id,
                ConversationName = conversation.DisplayNameFor(query.CurrentUserId),
                IsGroup = conversation.IsGroup,
                CreatedAt = conversation.CreatedAt,
                Messages = conversation.Messages.Select(x => new MessageDto
                {
                    MessageId = x.Id,
                    ConversationId = x.ConversationId,
                    SenderId = x.SenderId,
                    Content = x.Content,
                    SentAt = DateTime.SpecifyKind(x.SentAt, DateTimeKind.Utc),
                    SenderUsername = x.Sender.Username,
                    IsEdited = x.IsEdited ?? false,
                    Attachments = x.Attachments.Select(a => new AttachmentDto
                    {
                        AttachmentId = a.Id,
                        FileName = a.FileName,
                        FileUrl = $"/attachment/{a.Id}",
                        FileSize = a.FileSize,
                        ContentType = a.ContentType,
                        UploadedAt = a.UploadedAt
                    }).ToList()
                }).ToList(),
                Members = conversation.Members.Select(x => new MemberDto
                {
                    UserId = x.UserId,
                    Role = x.Role,
                    Name = x.User.Username,
                    IsOnline = x.User.IsOnline
                }).ToList(),
            };
        }
    }
}
