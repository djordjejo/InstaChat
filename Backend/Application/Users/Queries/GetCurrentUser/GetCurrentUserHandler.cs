using Application.Common;
using Application.Common.Exceptions;
using Application.DTO.User;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Queries.GetCurrentUser
{
    public class GetCurrentUserHandler : IRequestHandler<GetCurrentUserQuery, UserDto>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCurrentUserHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserDto> Handle(GetCurrentUserQuery query, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(query.UserId);
            if (user == null)
                throw new NotFoundException("Korisnik nije pronađen.");

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
