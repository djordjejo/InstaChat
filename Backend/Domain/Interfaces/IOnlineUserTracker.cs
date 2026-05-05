using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    // Record umesto klase jer je ovo čisti DTO bez ponašanja - samo nosi podatke.
    // Record automatski daje value equality, immutability, i lep konstruktor.
    public record OnlineUser(Guid UserId, string Username);
    public interface IOnlineUserTracker
    {
        void Add(Guid userId,string userName,string connectionId);
        void Remove(string connectionId);
        Guid? GetUserByIdConnection(string connectionId);
        IReadOnlyCollection<OnlineUser> GetOnlineUsers();
        bool IsOnline(Guid userId);
        

    }
}
