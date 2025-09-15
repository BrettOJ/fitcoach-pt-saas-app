using System.ComponentModel.DataAnnotations;

namespace FitCoach.msBoilerPlate.Models;

public class TemplateEntity
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Payload { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
