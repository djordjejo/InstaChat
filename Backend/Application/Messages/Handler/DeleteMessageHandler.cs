using Application.Common.Exceptions;
using Application.Messages.Command;
using Domain.Interfaces;
using MediatR;


namespace Application.Messages.Handler
{
    public class DeleteMessageHandler : IRequestHandler<DeleteMessageCommand, bool>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteMessageHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

            return true;
        }
    }
}
