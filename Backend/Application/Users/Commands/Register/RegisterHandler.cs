using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;


namespace Application.Users.Commands.Register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, RegisterResult>
    {
        private readonly IUnitOfWork unitOfWork;

        public RegisterHandler(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
        }

        public async Task<RegisterResult> Handle(RegisterCommand command, CancellationToken cancellationToken)
        {
            var existingUser = await unitOfWork.Users.GetUserByEmail(command.Email);
            if (existingUser != null)
                throw new ConflictException("Nalog sa ovim podacima već postoji.");

            var user = new User()
            {
                Id = Guid.NewGuid(),
                Username = command.Username,
                Email = command.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.Password),
                CreatedAt = DateTime.UtcNow,
                IsOnline = false
            };

            await unitOfWork.Users.AddAsync(user);
            await unitOfWork.Commit(cancellationToken);

            return new RegisterResult
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email
            };
        }

    }
}
