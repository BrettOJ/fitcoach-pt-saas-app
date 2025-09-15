using System.ComponentModel.DataAnnotations;

namespace FitCoach.UserManagement.Api.Models;

public class UserProfile
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Email { get; set; }

    [MaxLength(200)]
    public string? DisplayName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
