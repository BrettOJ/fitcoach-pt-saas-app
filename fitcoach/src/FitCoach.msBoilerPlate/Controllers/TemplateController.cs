using FitCoach.Common.Messaging;
using FitCoach.msBoilerPlate.Models;
using FitCoach.msBoilerPlate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FitCoach.msBoilerPlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplateController : ControllerBase
{
    private readonly ITemplateRepository _repo;
    private readonly KafkaProducer _producer;

    public TemplateController(ITemplateRepository repo, KafkaProducer producer)
    {
        _repo = repo;
        _producer = producer;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var item = await _repo.GetAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] TemplateEntity model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        model.Id = model.Id == Guid.Empty ? Guid.NewGuid() : model.Id;
        await _repo.AddAsync(model).ConfigureAwait(false);

        // Publish to Kafka topic 'managment' as example
        await _producer.ProduceAsync("managment", new { model.Id, model.Payload });

        return Accepted(new { model.Id });
    }
}
