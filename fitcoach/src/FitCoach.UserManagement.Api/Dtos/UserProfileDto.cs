using System.ComponentModel.DataAnnotations;

namespace FitCoach.UserManagement.Api.Dtos;

public class UserProfileDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    public string? DisplayName { get; set; }
}
