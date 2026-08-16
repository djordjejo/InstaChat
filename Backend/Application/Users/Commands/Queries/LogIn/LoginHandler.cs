using Application.Common.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Commands.Queries.LogIn
{
    public class LoginHandler : IRequestHandler<LoginQuery,LoginResult>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IJWTService jwtService;

        public LoginHandler(IUnitOfWork unitOfWork, IJWTService jwtService)
        {
            this.unitOfWork = unitOfWork;
            this.jwtService = jwtService;
        }

        public async Task<LoginResult> Handle(LoginQuery query, CancellationToken cancellationToken)
        {
            var user = await unitOfWork.Users.GetUserByEmail(query.Email);
            if (user == null)
                throw new InvalidCredentialsException("Pogrešan email ili lozinka.");

            bool isValid = BCrypt.Net.BCrypt.Verify(query.Password, user.PasswordHash);
            if (!isValid)
                throw new InvalidCredentialsException("Pogrešan email ili lozinka.");

            var token = jwtService.GenerateToken(user);

            return new LoginResult
            {
                Token = token,
                Username = user.Username,
                UserId = user.Id
            };
        }

     
    }
}
