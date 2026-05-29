using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public record OnlineUser(Guid UserId, string Username);
    public interface IOnlineUserTracker
    {
        void Add(Guid userId,string userName,string connectionId);
        void Remove(string connectionId);
        Guid? GetUserByIdConnection(string connectionId);
        List<string> GetConnectionIdsForUser(Guid userId);
        IReadOnlyCollection<OnlineUser> GetOnlineUsers();
        bool IsOnline(Guid userId);
        

    }
}
