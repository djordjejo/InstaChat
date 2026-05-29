using Domain.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Repository
{
    public class OnlineUserTracker : IOnlineUserTracker
    {
        private readonly ConcurrentDictionary<string, OnlineUser> _connections = new ConcurrentDictionary<string, OnlineUser>();
        public void Add(Guid userId, string userName, string connectionId)
        {
            _connections[connectionId] = new OnlineUser( userId, userName );
        }

        public IReadOnlyCollection<OnlineUser> GetOnlineUsers()
        {
            return _connections.Values
                       .DistinctBy(u => u.UserId)
                       .ToList();
        }

        public Guid? GetUserByIdConnection(string connectionId)
        {
            return _connections.TryGetValue(connectionId, out var onlineUser) ? onlineUser.UserId  : (Guid?)null;
        }

        public bool IsOnline(Guid userId)
        {
            return _connections.Values.Any(u=> u.UserId == userId);
        }
        public List<string> GetConnectionIdsForUser(Guid userId)
        {
            return _connections
                .Where(kvp => kvp.Value.UserId == userId)
                .Select(kvp => kvp.Key)
                .ToList();
        }

        public void Remove(string connectionId)
        {
            _connections.TryRemove(connectionId, out _);
        }
    }
}
