using Application.Interfaces;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AttachmentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public AttachmentController(IUnitOfWork unitOfWork, IFileStorage fileStorage)
        {
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        /// <summary>
        /// Preuzimanje priloga. OVO je razlog zasto fajlovi nisu u wwwroot-u:
        /// pre nego sto se posalje ijedan bajt, proverava se da li je pozivalac
        /// clan razgovora kome poruka pripada. Staticki fajl to ne bi mogao.
        /// </summary>
        [HttpGet("{attachmentId}")]
        public async Task<IActionResult> Download(Guid attachmentId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var attachment = await _unitOfWork.MessageAttachments
                .GetWithMessageAsync(attachmentId);

            // Nepostojeci prilog i tudji prilog daju ISTI odgovor - inace bi se
            // po razlici 404/403 moglo mapirati koji ID-jevi postoje.
            if (attachment?.Message == null)
                return NotFound();

            var isMember = await _unitOfWork.ConversationMembers
                .IsMemberAsync(userId, attachment.Message.ConversationId);

            if (!isMember)
                return NotFound();

            var stream = _fileStorage.Open(attachment.FileUrl);
            if (stream == null)
                return NotFound();

            // enableRangeProcessing: browser moze da trazi delove fajla, sto je
            // korisno za vece slike i buduce video priloge.
            return File(stream, attachment.ContentType, attachment.FileName, enableRangeProcessing: true);
        }
    }
}
