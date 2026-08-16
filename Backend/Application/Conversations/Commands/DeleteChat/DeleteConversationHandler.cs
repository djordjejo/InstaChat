using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.EnumMember;
using Domain.Interfaces;
using MediatR;

namespace Application.Conversations.Commands.DeleteChat
{
    public class DeleteConversationHandler : IRequestHandler<DeleteConversationCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotificationService _chatNotificationService;

        public DeleteConversationHandler(
            IUnitOfWork unitOfWork,
            IChatNotificationService chatNotificationService)
        {
            _unitOfWork = unitOfWork;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<Unit> Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
        {
           
            var member = await _unitOfWork.ConversationMembers
                .GetMemberAsync(request.UserId, request.ConversationId);

            if (member == null)
                throw new ForbiddenException("Nemate pristup ovom razgovoru.");

            var conversation = await _unitOfWork.Conversations
                .GetByIdAsync(request.ConversationId);

            if (conversation == null)
                throw new NotFoundException("Razgovor nije pronađen.");

            // U 1-na-1 razgovoru su oba ucesnika ravnopravna. U grupi brisanje
            // sme samo admin, inace bi svako mogao da obrise tudju grupu.
            if (conversation.IsGroup && member.Role != MemberRole.Admin)
                throw new ForbiddenException("Samo administrator grupe može obrisati razgovor.");

            // Clanove kupimo PRE brisanja - posle kaskade ih vise nema u bazi.
            var memberIds = await _unitOfWork.ConversationMembers
                .GetMemberIdsAsync(request.ConversationId);

            await _unitOfWork.Conversations.DeleteAsync(conversation);
            await _unitOfWork.Commit(cancellationToken);

            await _chatNotificationService.ConversationDeletedAsync(
                request.ConversationId, memberIds);

            return Unit.Value;
        }
    }
}