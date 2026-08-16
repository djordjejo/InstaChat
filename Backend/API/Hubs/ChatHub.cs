using Domain.Interfaces;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
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

        public IReadOnlyCollection<OnlineUser> GetOnlineUsers()
        {
            return _onlineTracker.GetOnlineUsers().ToList();
        }
        public override async Task OnConnectedAsync()
        {
            var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
                if (!_onlineTracker.IsOnline(userId.Value))
                {
                    await Clients.Others.SendAsync("UserOffline", userId.Value);
                }
                var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);

                user.IsOnline = false;
                user.LastSeen = DateTime.UtcNow;

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Commit(Context.ConnectionAborted);

            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task StartTyping(string conversationId)
        {
            var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);


            await Clients.OthersInGroup(conversationId)
                .SendAsync("UserTyping", new
                {
                    UserId = userId,
                    UserName = user?.Username,
                    ConversationId = conversationId
                });
        }
        public async Task StopTyping(string conversationId)
        {
            var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);


            await Clients.OthersInGroup(conversationId)
                .SendAsync("UserStopTyping", new
                {
                    UserId = userId,
                    ConversationId = conversationId
                });
        }

        public async Task JoinConversation(string conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

    }
}
