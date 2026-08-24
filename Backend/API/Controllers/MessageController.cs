using Application.Common;
using Application.Messages.Command;
using Application.Messages.Handler;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/[controller]")]
   
    public class MessageController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MessageController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(SendMessageCommand command)
        {
            var senderId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            command.SenderId = senderId;
            var result = await _mediator.Send(command);

            return Ok(result);
        }
        /// <summary>
        /// Slanje slike. Multipart, pa [FromForm]. Kontroler procita stream u
        /// bajtove i preda obican UploadedFile - IFormFile ne sme dalje od ovog
        /// sloja, jer bi Application zavisio od ASP.NET-a.
        /// </summary>
        [HttpPost("send-image")]
        [RequestSizeLimit(6 * 1024 * 1024)]
        public async Task<IActionResult> SendImage(
            [FromForm] Guid conversationId,
            [FromForm] string? content,
            IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ProblemDetails { Title = "Fajl nije poslat." });

            var senderId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            using var memory = new MemoryStream();
            await file.CopyToAsync(memory);

            var result = await _mediator.Send(new SendImageMessageCommand
            {
                SenderId = senderId,
                ConversationId = conversationId,
                Content = content,
                File = new UploadedFile
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    Content = memory.ToArray()
                }
            });

            return Ok(result);
        }

        [HttpPut("edit/{messageId}")]
        public async Task<IActionResult> EditMessage(Guid messageId,
            EditMessageCommand command)
        {
            var senderId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _mediator.Send(new EditMessageCommand
            {
                MessageId = messageId,
                EditorId = senderId,
                Content = command.Content
            });
            return Ok(result);
        }

        [HttpDelete("{messageId}")]
        public async Task<IActionResult> DeleteMessage(Guid messageId)
        {
            var senderId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _mediator.Send(new DeleteMessageCommand
            { 
                MessageId = messageId,
                SenderId = senderId
            });

            return Ok(result);
        }
    }
}
