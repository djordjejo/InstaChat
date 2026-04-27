using Application.Conversations.Queries;
using Application.DTO;
using Application.DTO.Conversation;
using Domain.Entities;
using Domain.EnumMember;
using Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace Application.Conversations.Commands;

public class CreateConversationHandler : IRequestHandler<CreateConversationQuery, ConversationDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateConversationHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
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

        return new ConversationDto
        {
            ConversationId = conversation.Id,
            ConversationName = conversation.Name,
            IsGroup = conversation.IsGroup,
            CreatedAt = conversation.CreatedAt
        };
    }
}