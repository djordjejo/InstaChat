using Domain.EnumMember;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTO.Member
{
    public class MemberDto
    {
        public Guid UserId { get; set; }
        public string Name{ get; set; } 
        public MemberRole Role { get; set; } 
        public bool IsOnline { get; set; }

    }
}
