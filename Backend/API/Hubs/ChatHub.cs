using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;   
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOnlineUserTracker _onlineTracker;

        public ChatHub(IUnitOfWork unitOfWork, IOnlineUserTracker onlineUserTracker)
        {
            _unitOfWork = unitOfWork;
            _onlineTracker = onlineUserTracker;
        }
        private Guid GetUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(claim, out var userId))
                throw new HubException("Neispravan identitet korisnika.");

            return userId;
        }

        
        private async Task<Guid> EnsureMemberAsync(string conversationId)
        {
            if (!Guid.TryParse(conversationId, out var convId))
                throw new HubException("Neispravan ID razgovora.");

            var userId = GetUserId();

            if (!await _unitOfWork.ConversationMembers.IsMemberAsync(userId, convId))
                throw new HubException("Nemate pristup ovom razgovoru.");

            return convId;
        }
        public IReadOnlyCollection<OnlineUser> GetOnlineUsers()
        {
            return _onlineTracker.GetOnlineUsers().ToList();
        }
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            if (user != null)
            {
                _onlineTracker.Add(userId, user.Username, Context.ConnectionId);

                user.IsOnline = true;
                user.LastSeen = DateTime.UtcNow;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Commit(Context.ConnectionAborted);

                await Clients.Others.SendAsync("UserOnline", new { userId, username = user.Username });

                var conversationIds = await _unitOfWork.Conversations.GetConversationIdsForUserAsync(userId);

                foreach (var convId in conversationIds)
                { 
                    await Groups.AddToGroupAsync(Context.ConnectionId, convId.ToString());
                }
            }

            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {

            var userId = _onlineTracker.GetUserByIdConnection(Context.ConnectionId);

            _onlineTracker.Remove(Context.ConnectionId); 

            if (userId.HasValue)
            {
                // Korisnik moze imati vise otvorenih konekcija (vise tabova).
                // Offline je tek kad nestane POSLEDNJA. Ranije je upis u bazu
                // bio VAN ovog if-a, pa je zatvaranje jednog taba proglasavalo
                // korisnika offline iako je i dalje bio prisutan.
                if (!_onlineTracker.IsOnline(userId.Value))
                {
                    await Clients.Others.SendAsync("UserOffline", userId.Value);

                    var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);

                    // Null je moguc ako je nalog obrisan dok je konekcija bila
                    // otvorena. OnConnectedAsync je ovu proveru imao, ovde je
                    // nedostajala.
                    if (user != null)
                    {
                        user.IsOnline = false;
                        user.LastSeen = DateTime.UtcNow;

                        await _unitOfWork.Users.UpdateAsync(user);

                        // CancellationToken.None, NE Context.ConnectionAborted.
                        // Taj token je pri diskonektu vec otkazan, pa je
                        // SaveChangesAsync odmah bacao OperationCanceledException
                        // i IsOnline se NIKAD nije upisao u bazu - svi korisnici
                        // su u bazi zauvek ostajali "online".
                        await _unitOfWork.Commit(CancellationToken.None);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task StartTyping(string conversationId)
        {
            var convId = await EnsureMemberAsync(conversationId);
            var userId = GetUserId();                          
            var user = await _unitOfWork.Users.GetByIdAsync(userId);


            await Clients.OthersInGroup(convId.ToString())
                .SendAsync("UserTyping", new
                {
                    UserId = userId,
                    UserName = user?.Username,
                    ConversationId = convId
                });
        }
        public async Task StopTyping(string conversationId)
        {
            var convId = await EnsureMemberAsync(conversationId);
            var userId = GetUserId();

            await Clients.OthersInGroup(convId.ToString())
                .SendAsync("UserStopTyping", new
                {
                    UserId = userId,
                    ConversationId = convId
                });
        }

        public async Task JoinConversation(string conversationId)
        {
            var convId = await EnsureMemberAsync(conversationId);

            await Groups.AddToGroupAsync(Context.ConnectionId, convId.ToString());
        }

        public async Task LeaveConversation(string conversationId)
        {
            if (!Guid.TryParse(conversationId, out var convId))
                throw new HubException("Neispravan ID razgovora.");

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, convId.ToString());
        }

    }
}
