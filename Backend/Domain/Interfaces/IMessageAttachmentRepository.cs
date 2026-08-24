using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IMessageAttachmentRepository : IRepository<MessageAttachment>
    {
        /// <summary>
        /// Prilog zajedno sa porukom kojoj pripada. Poruka nosi ConversationId,
        /// bez kog se ne moze proveriti sme li pozivalac da vidi fajl.
        /// </summary>
        Task<MessageAttachment?> GetWithMessageAsync(Guid attachmentId);
    }
}
