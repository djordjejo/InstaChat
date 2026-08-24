using Application.DTO.User;
using MediatR;

namespace Application.Users.Queries.GetCurrentUser
{
    /// <summary>
    /// Podaci o prijavljenom korisniku. Iz tokena se ne mogu dobiti - u JWT-u
    /// stoje samo ime i email, a avatar se menja bez izdavanja novog tokena.
    /// </summary>
    public class GetCurrentUserQuery : IRequest<UserDto>
    {
        public Guid UserId { get; set; }

        public GetCurrentUserQuery(Guid userId)
        {
            UserId = userId;
        }
    }
}
