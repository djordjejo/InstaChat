using Application.DTO.User;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Queries.GetUsers
{
    public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetUsersHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<UserDto>> Handle(GetUsersQuery query, CancellationToken cancellationToken)
        {
            // Pozivalac se iskljucuje na nivou upita, ne filtriranjem u memoriji -
            // nema smisla dovlaciti red pa ga odbaciti.
            var users = await _unitOfWork.Users.GetAllExceptAsync(query.CurrentUserId);

            return users.Select(u => new UserDto
            {
                UserId = u.Id,
                Username = u.Username,
                AvatarUrl = u.AvatarUrl,
                IsOnline = u.IsOnline,
                LastSeen = u.LastSeen
            }).ToList();
        }
    }
}
