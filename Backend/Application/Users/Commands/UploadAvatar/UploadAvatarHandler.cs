using Application.Common;
using Application.Common.Exceptions;
using Application.DTO.User;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Commands.UploadAvatar
{
    public class UploadAvatarHandler : IRequestHandler<UploadAvatarCommand, UserDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public UploadAvatarHandler(IUnitOfWork unitOfWork, IFileStorage fileStorage)
        {
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        public async Task<UserDto> Handle(UploadAvatarCommand command, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(command.UserId);
            if (user == null)
                throw new NotFoundException("Korisnik nije pronađen.");

            // Ekstenzija se izvodi iz PROVERENOG content type-a, ne iz imena
            // fajla koje je poslao klijent.
            var extension = ImageValidation.ExtensionFor(command.File.ContentType);
            var storedName = await _fileStorage.SaveAsync(
                command.File.Content, extension, cancellationToken);

            var previous = user.AvatarUrl;

            user.AvatarUrl = storedName;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.Commit(cancellationToken);

            // Stara slika se brise TEK posle uspesnog commit-a. Obrnutim
            // redosledom bi pad upisa ostavio korisnika bez ijedne slike: u bazi
            // bi i dalje stajalo staro ime, a fajla vise ne bi bilo.
            if (!string.IsNullOrWhiteSpace(previous))
                _fileStorage.Delete(previous);

            return new UserDto
            {
                UserId = user.Id,
                Username = user.Username,
                AvatarUrl = AvatarUrls.For(user.Id, user.AvatarUrl),
                IsOnline = user.IsOnline,
                LastSeen = user.LastSeen
            };
        }
    }
}
