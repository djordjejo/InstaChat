using Application.Users.Queries.GetUsers;
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

        public UserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Svi korisnici osim pozivaoca. Nema pretrage ni paginacije - za ovaj
        /// obim je nepotrebno; sa vecim brojem korisnika ovde bi islo oboje.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _mediator.Send(new GetUsersQuery(userId));
            return Ok(result);
        }
    }
}
