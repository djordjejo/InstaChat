using Application.Common;
using Application.Interfaces;
using Application.Users.Commands.DeleteAvatar;
using Application.Users.Commands.UploadAvatar;
using Application.Users.Queries.GetCurrentUser;
using Application.Users.Queries.GetUsers;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public UserController(IMediator mediator, IUnitOfWork unitOfWork, IFileStorage fileStorage)
        {
            _mediator = mediator;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        /// <summary>
        /// Svi korisnici osim pozivaoca. Nema pretrage ni paginacije - za ovaj
        /// obim je nepotrebno; sa vecim brojem korisnika ovde bi islo oboje.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _mediator.Send(new GetUsersQuery(CurrentUserId));
            return Ok(result);
        }

        /// <summary>
        /// Profil prijavljenog korisnika. Frontend ovo ne moze iz tokena: JWT
        /// nosi ime i email, ali ne i avatar, koji se menja bez nove prijave.
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var result = await _mediator.Send(new GetCurrentUserQuery(CurrentUserId));
            return Ok(result);
        }

        /// <summary>
        /// Postavljanje profilne slike. Multipart, pa je isti obrazac kao kod
        /// slanja slike u poruci: kontroler procita stream u bajtove i preda
        /// obican UploadedFile, da Application ne zavisi od ASP.NET-a.
        /// </summary>
        [HttpPost("avatar")]
        [RequestSizeLimit(6 * 1024 * 1024)]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ProblemDetails { Title = "Fajl nije poslat." });

            using var memory = new MemoryStream();
            await file.CopyToAsync(memory);

            var result = await _mediator.Send(new UploadAvatarCommand
            {
                UserId = CurrentUserId,
                File = new UploadedFile
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    Content = memory.ToArray()
                }
            });

            return Ok(result);
        }

        [HttpDelete("avatar")]
        public async Task<IActionResult> DeleteAvatar()
        {
            var result = await _mediator.Send(new DeleteAvatarCommand(CurrentUserId));
            return Ok(result);
        }

        /// <summary>
        /// Slika korisnika. Kao i kod priloga, fajl je izvan wwwroot-a i ide
        /// kroz endpoint - avatar vidi svaki PRIJAVLJEN korisnik, ali ne i
        /// slucajni prolaznik koji pogodi adresu.
        ///
        /// Ide direktno preko repozitorijuma, bez MediatR-a: rezultat je stream,
        /// a ne DTO, pa handler nema sta da vrati.
        /// </summary>
        [HttpGet("{userId}/avatar")]
        public async Task<IActionResult> GetAvatar(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            // Korisnik bez slike i nepostojeci korisnik daju ISTI odgovor - po
            // razlici 404/204 bi se moglo mapirati koji ID-jevi postoje.
            if (user?.AvatarUrl == null)
                return NotFound();

            var stream = _fileStorage.Open(user.AvatarUrl);
            if (stream == null)
                return NotFound();

            var contentType = ImageValidation.ContentTypeFor(Path.GetExtension(user.AvatarUrl));

            return File(stream, contentType);
        }
    }
}
