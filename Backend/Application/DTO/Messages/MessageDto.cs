using Application.DTO.Attachment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTO.Messages
{
    public class MessageDto
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }   
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public bool IsEdited { get; set; } = false;
        public List<AttachmentDto> Attachments { get; set; } = new();
    }
}
