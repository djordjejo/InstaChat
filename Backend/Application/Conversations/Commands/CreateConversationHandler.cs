using Application.Conversations.Queries;
using Application.DTO;
using Application.DTO.Conversation;
using Application.DTO.Member;
using Application.DTO.Messages;
using Domain.Entities;
using Domain.EnumMember;
using Domain.Interfaces;
using MediatR;

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

        // Dodaj kreatora kao Admin člana
        var creatorMember = new ConversationMember
        {
            UserId = command.CreatedById,
            ConversationId = conversation.Id,
            Role = MemberRole.Admin,
            JoinedAt = DateTime.UtcNow
        };
        await _unitOfWork.ConversationMembers.AddAsync(creatorMember);

        // Dodaj ostale članove
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

        // Učitaj kompletan razgovor sa članovima
        var fullConversation = await _unitOfWork.ConversationMembers
            .GetConversationAsync(conversation.Id);

        // Za 1-na-1 razgovor, postavi ime na username drugog korisnika
        if (!fullConversation.IsGroup && string.IsNullOrEmpty(fullConversation.Name))
        {
            var otherMember = fullConversation.Members
                .FirstOrDefault(m => m.UserId != command.CreatedById);

            if (otherMember != null)
            {
                fullConversation.Name = otherMember.User.Username;
                await _unitOfWork.Conversations.UpdateAsync(fullConversation);
                await _unitOfWork.Commit(cancellationToken);
            }
        }

        return new ConversationDto
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
    }
}