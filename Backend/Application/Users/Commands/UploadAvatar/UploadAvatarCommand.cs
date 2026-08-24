using Application.Common;
using Application.DTO.User;
using MediatR;

namespace Application.Users.Commands.UploadAvatar
{
    /// <summary>
    /// Postavljanje profilne slike. UserId popunjava kontroler iz tokena -
    /// namerno se NE prima od klijenta, inace bi svako mogao da menja tudji
    /// avatar.
    /// </summary>
    public class UploadAvatarCommand : IRequest<UserDto>
    {
        public Guid UserId { get; set; }

        public UploadedFile File { get; set; } = new();
    }
}
