using Domain.Entities;

namespace Application.Common
{
    public static class ConversationExtensions
    {
        public static string DisplayNameFor(this Conversation conversation, Guid currentUserId)
        {
            if (conversation.IsGroup)
            {
                return string.IsNullOrWhiteSpace(conversation.Name)
                    ? "Grupa"
                    : conversation.Name;
            }

            var peer = conversation.Members
                .FirstOrDefault(m => m.UserId != currentUserId);

            return peer?.User?.Username ?? "Nepoznat korisnik";
        }
    }
}
