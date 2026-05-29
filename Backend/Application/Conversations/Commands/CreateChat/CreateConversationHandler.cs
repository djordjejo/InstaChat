using Application.DTO;
using Application.DTO.Conversation;
using Application.DTO.Member;
using Application.DTO.Messages;
using Application.Interfaces;
using Domain.Entities;
using Domain.EnumMember;
using Domain.Interfaces;
using MediatR;

namespace Application.Conversations.Commands.CreateChat;

public class CreateConversationHandler : IRequestHandler<CreateConversationQuery, ConversationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IChatNotificationService _chatNotificationService;  


    public CreateConversationHandler(IUnitOfWork unitOfWork, IChatNotificationService chatNotificationService)
    {
        _unitOfWork = unitOfWork;
        _chatNotificationService = chatNotificationService;
    }

    public async Task<ConversationDto> Handle(
        CreateConversationQuery command,
        CancellationToken cancellationToken)
    {
        if (command == null)
            throw new Exception("Conversation obj is null");

        var conversation = new Conversation
        {
            Name = command.Name,
            IsGroup = command.IsGroup,
            CreatedById = command.CreatedById,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Conversations.AddAsync(conversation);
        await _unitOfWork.Commit(cancellationToken);
        var allMemberIds = command.MemberIds
          .Concat(new[] { command.CreatedById })
          .Distinct();

        await _chatNotificationService.AddUsersToConversationGroupAsync(
          conversation.Id,
          allMemberIds);

        var creatorMember = new ConversationMember
        {
            UserId = command.CreatedById,
            ConversationId = conversation.Id,
            Role = MemberRole.Admin,
            JoinedAt = DateTime.UtcNow
        };
        await _unitOfWork.ConversationMembers.AddAsync(creatorMember);

        foreach (var memberId in command.MemberIds)
        {
            if (memberId == command.CreatedById) continue;

            var member = new ConversationMember
            {
                UserId = memberId,
                ConversationId = conversation.Id,
                Role = MemberRole.Member,
                JoinedAt = DateTime.UtcNow
            };
            await _unitOfWork.ConversationMembers.AddAsync(member);
        }

        await _unitOfWork.Commit(cancellationToken);

        var fullConversation = await _unitOfWork.ConversationMembers
            .GetConversationAsync(conversation.Id);


        var conversationDto = new ConversationDto
        {
            ConversationId = fullConversation.Id,
            ConversationName = fullConversation.Name,
            IsGroup = fullConversation.IsGroup,
            CreatedAt = fullConversation.CreatedAt,
            Members = fullConversation.Members.Select(m => new MemberDto
            {
                UserId = m.UserId,
                Name = m.User.Username,
                IsOnline = m.User.IsOnline
            }).ToList(),
            Messages = new List<MessageDto>()
        };

        await _chatNotificationService.NotifyConversationCreatedAsync(
          allMemberIds,
          conversationDto);

        return conversationDto;
    }
}