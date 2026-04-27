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
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                user.IsOnline = true;
                user.LastSeen = DateTime.UtcNow;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Commit(Context.ConnectionAborted);

            }

            await Clients.Others.SendAsync("UserOnline", userId);
            await base.OnConnectedAsync();

        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {

            var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            if (user != null)
            {
                user.IsOnline = false;
                user.LastSeen = DateTime.UtcNow;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Commit(Context.ConnectionAborted);

            }

            await Clients.Others.SendAsync("UserOffline", userId);
            await base.OnConnectedAsync();
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
