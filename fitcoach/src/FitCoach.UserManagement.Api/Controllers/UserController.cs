using FitCoach.Common.Messaging;
using Microsoft.AspNetCore.Mvc;
using FitCoach.UserManagement.Api.Repositories;

namespace FitCoach.UserManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly KafkaProducer _producer;
    private readonly IUserRepository _repository;

    public UserController(KafkaProducer producer, IUserRepository repository)
    {
        _producer = producer;
        _repository = repository;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { Message = "FitCoach User Management API" });

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Dtos.UserProfileDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new Models.UserProfile
        {
            Id = dto.UserId == Guid.Empty ? Guid.NewGuid() : dto.UserId,
            Email = dto.Email,
            DisplayName = dto.DisplayName
        };

        await _repository.AddAsync(user).ConfigureAwait(false);

        var evt = new UserCreated(user.Id, user.Email);
        await _producer.ProduceAsync("managment", evt).ConfigureAwait(false);

        return Accepted(new { user.Id });
    }
}

public record UserCreated(Guid UserId, string Email);

