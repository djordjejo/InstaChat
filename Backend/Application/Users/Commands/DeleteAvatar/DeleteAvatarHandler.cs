using Application.Common.Exceptions;
using Application.DTO.User;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Commands.DeleteAvatar
{
    public class DeleteAvatarHandler : IRequestHandler<DeleteAvatarCommand, UserDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public DeleteAvatarHandler(IUnitOfWork unitOfWork, IFileStorage fileStorage)
        {
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        public async Task<UserDto> Handle(DeleteAvatarCommand command, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(command.UserId);
            if (user == null)
                throw new NotFoundException("Korisnik nije pronađen.");

            var previous = user.AvatarUrl;

            // Korisnik koji nema sliku nije greska - poziv je idempotentan.
            if (!string.IsNullOrWhiteSpace(previous))
            {
                user.AvatarUrl = null;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Commit(cancellationToken);

                _fileStorage.Delete(previous);
            }

            return new UserDto
            {
                UserId = user.Id,
                Username = user.Username,
                AvatarUrl = null,
                IsOnline = user.IsOnline,
                LastSeen = user.LastSeen
            };
        }
    }
}
