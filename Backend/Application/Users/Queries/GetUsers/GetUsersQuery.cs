using Application.DTO.User;
using MediatR;

namespace Application.Users.Queries.GetUsers
{
    public class GetUsersQuery : IRequest<List<UserDto>>
    {
        public Guid CurrentUserId { get; set; }

        public GetUsersQuery(Guid currentUserId)
        {
            CurrentUserId = currentUserId;
        }
    }
}
