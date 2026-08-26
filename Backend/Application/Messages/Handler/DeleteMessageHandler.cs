using Application.Common.Exceptions;
using Application.Interfaces;
using Application.Messages.Command;
using Domain.Interfaces;
using MediatR;


namespace Application.Messages.Handler
{
    public class DeleteMessageHandler : IRequestHandler<DeleteMessageCommand, bool>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotificationService _chatNotificationService;

        public DeleteMessageHandler(IUnitOfWork unitOfWork, IChatNotificationService chatNotificationService)
        {
            _unitOfWork = unitOfWork;
            _chatNotificationService = chatNotificationService;
        }
        public async Task<bool> Handle(DeleteMessageCommand command, CancellationToken cancellationToken)
        {
            var message = await _unitOfWork.Messages.GetByIdAsync(command.MessageId);
            if (message == null)
                throw new NotFoundException("Poruka nije pronađena.");


            if (message.SenderId != command.SenderId)
                throw new ForbiddenException("Nemate dozvolu da obrišete ovu poruku.");

            message.IsDeleted = true;
            await _unitOfWork.Messages.UpdateAsync(message);
            await _unitOfWork.Commit(cancellationToken);

            // Ostali ucesnici moraju da uklone poruku iz svog prikaza. Bez ovoga
            // bi je videli sve dok ponovo ne otvore razgovor - a tada je vise
            // nema, jer GetConversationAsync preskace soft-obrisane poruke.
            await _chatNotificationService.MessageDeletedAsync(message.ConversationId, message.Id);

            return true;
        }
    }
}
