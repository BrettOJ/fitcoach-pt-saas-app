using FitCoach.UserManagement.Api.Models;

namespace FitCoach.UserManagement.Api.Repositories;

public interface IUserRepository
{
    Task AddAsync(UserProfile user);
    Task<UserProfile?> GetByIdAsync(Guid id);
}
