using Microsoft.EntityFrameworkCore;
using FitCoach.UserManagement.Api.Models;

namespace FitCoach.UserManagement.Api.Data;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> Users { get; set; }
}
