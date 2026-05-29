using Application.Conversations.Commands.CreateChat;
using Application.Conversations.Commands.DeleteChat;
using Application.Conversations.Queries.GetChats;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConversationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConversationController(IMediator mediator)
        {
            this._mediator = mediator;
        }
        [HttpGet("getConversation/{conversationId}")]
        public async Task<IActionResult> GetConversationById(Guid conversationId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _mediator.Send(new GetConversationQuery(conversationId, userId));

            return Ok(result);
        }


        [HttpGet]
        public async Task<IActionResult> GetConversations()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _mediator.Send(new GetConversationsQuery(userId));
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateChat(CreateConversationQuery query)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            query.CreatedById = userId;

            var result = await _mediator.Send(query);
            return Created("", result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(Guid id)
        {
            var result = await _mediator.Send(new DeleteConversationCommand(id));
            return NoContent();
        }
    }
}
