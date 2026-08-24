using Application.DTO.User;
using MediatR;

namespace Application.Users.Commands.DeleteAvatar
{
    /// <summary>Uklanjanje profilne slike - prikaz se vraca na inicijale.</summary>
    public class DeleteAvatarCommand : IRequest<UserDto>
    {
        public Guid UserId { get; set; }

        public DeleteAvatarCommand(Guid userId)
        {
            UserId = userId;
        }
    }
}
