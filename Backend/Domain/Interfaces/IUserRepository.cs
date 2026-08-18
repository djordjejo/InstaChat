using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetUserByEmail(string email);

        /// <summary>
        /// Svi korisnici osim zadatog, sortirani po imenu. Koristi ga lista za
        /// pokretanje razgovora - bez ovoga se moze pisati samo onima koji su
        /// bas u tom trenutku prijavljeni.
        /// </summary>
        Task<List<User>> GetAllExceptAsync(Guid excludedUserId);
    }
}
