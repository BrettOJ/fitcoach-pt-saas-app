using FitCoach.Common.Messaging;
using Microsoft.AspNetCore.Mvc;

namespace FitCoach.Workout.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkoutController : ControllerBase
{
    private readonly KafkaProducer _producer;

    public WorkoutController(KafkaProducer producer)
    {
        _producer = producer;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { Message = "FitCoach Workout API" });

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] WorkoutLogged evt)
    {
        await _producer.ProduceAsync("workout", evt);
        return Accepted();
    }
}

public record WorkoutLogged(Guid UserId, DateTimeOffset StartedAt, int DurationMinutes);

