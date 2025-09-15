using FitCoach.UserManagement.Api.Data;
using FitCoach.UserManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitCoach.UserManagement.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly UserDbContext _db;

    public UserRepository(UserDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(UserProfile user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync().ConfigureAwait(false);
    }

    public async Task<UserProfile?> GetByIdAsync(Guid id)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id).ConfigureAwait(false);
    }
}
