using Application.DTO.Conversation;
using Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations.Commands.DeleteChat
{
    public class DeleteConversationHandler : IRequestHandler<DeleteConversationCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteConversationHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
        {
            var chat = _unitOfWork.Conversations.GetByIdAsync(request.ConversationId).Result;
            await _unitOfWork.Conversations.DeleteAsync(chat);
            await _unitOfWork.Commit(cancellationToken);

            return Unit.Value; 
        }
    }
}
