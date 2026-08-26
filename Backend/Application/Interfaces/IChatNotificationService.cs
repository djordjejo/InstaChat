using Application.DTO.Messages;

namespace Application.Interfaces
{
    public interface IChatNotificationService
    {
        Task SendMessageAsync(Guid conversationId, MessageDto message);

        /// <summary>
        /// Izmenjena poruka. Bez ovoga bi novi sadrzaj video samo onaj ko je
        /// menja - ostali tek posle ponovnog ucitavanja razgovora.
        /// </summary>
        Task MessageUpdatedAsync(Guid conversationId, MessageDto message);

        /// <summary>
        /// Obrisana poruka. Salje se samo par identifikatora: sadrzaj je upravo
        /// ono sto vise ne treba da stigne do klijenata.
        /// </summary>
        Task MessageDeletedAsync(Guid conversationId, Guid messageId);

        Task ConversationCreatedAsync(Guid conversationId, IEnumerable<Guid> memberIds);
        Task ConversationDeletedAsync(Guid conversationId, IEnumerable<Guid> memberIds);
    }
}
