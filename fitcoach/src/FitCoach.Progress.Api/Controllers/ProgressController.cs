using FitCoach.Common.Messaging;
using Microsoft.AspNetCore.Mvc;

namespace FitCoach.Progress.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly KafkaProducer _producer;

    public ProgressController(KafkaProducer producer)
    {
        _producer = producer;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { Message = "FitCoach Progress API" });

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ProgressUpdated evt)
    {
        await _producer.ProduceAsync("progress", evt);
        return Accepted();
    }
}

public record ProgressUpdated(Guid UserId, DateTimeOffset Timestamp, int Score);

