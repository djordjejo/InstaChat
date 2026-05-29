using Application.Users.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Update.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Users.Commands.Queries.LogIn;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
        [ApiController]
        [Route("api/[controller]")]
        public class AuthController : ControllerBase
        {
            private readonly IMediator _mediator;

            public AuthController(IMediator mediator)
            {
                _mediator = mediator;
            }
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [AllowAnonymous]
        [HttpPost("login")]
            public async Task<IActionResult> Login(LoginQuery query)
            {
                var result = await _mediator.Send(query);

                if (result == null)
                    return Unauthorized("Pogrešan email ili lozinka.");

                return Ok(result);
            }
        }
}

