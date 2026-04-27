using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTO.Member;
using Application.DTO.Messages;
using Domain.Entities;
namespace Application.DTO.Conversation
{
    public class ConversationDto
    {
        public Guid ConversationId { get; set; }
        public string ConversationName { get; set; }
        public bool IsGroup { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AvatarUrl { get; set; }
        public List<MemberDto> Members { get; set; }
        public List<MessageDto> Messages { get; set;}
    }
}
