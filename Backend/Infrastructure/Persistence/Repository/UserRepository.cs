using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DBContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repository
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<List<User>> GetAllExceptAsync(Guid excludedUserId)
        {
            // AsNoTracking: rezultat je samo za citanje, nema razloga da change
            // tracker pamti svakog korisnika u bazi.
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.Id != excludedUserId)
                .OrderBy(u => u.Username)
                .ToListAsync();
        }
    }
}
