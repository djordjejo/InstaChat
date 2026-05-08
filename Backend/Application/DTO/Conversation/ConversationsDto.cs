using Application.DTO.Member;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTO.Conversation
{
    public class ConversationsDto
    {
        public Guid ConversationId { get; set; }
        public string ConversationName { get; set; }
        public IEnumerable<MemberDto>? Members { get; set; }
        public string AvatarUrl { get; set; }
    }
}
