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

            return conversation.PeerOf(currentUserId)?.User?.Username ?? "Nepoznat korisnik";
        }

        /// <summary>
        /// Slika razgovora u listi. Za 1-na-1 to je avatar sagovornika - isto
        /// kao sto je i ime razgovora njegovo ime. Grupa jos nema svoju sliku,
        /// pa pada na inicijale.
        /// </summary>
        public static string? AvatarUrlFor(this Conversation conversation, Guid currentUserId)
        {
            if (conversation.IsGroup)
                return null;

            var peer = conversation.PeerOf(currentUserId);
            if (peer?.User == null)
                return null;

            return AvatarUrls.For(peer.UserId, peer.User.AvatarUrl);
        }

        private static ConversationMember? PeerOf(this Conversation conversation, Guid currentUserId) =>
            conversation.Members.FirstOrDefault(m => m.UserId != currentUserId);
    }
}
