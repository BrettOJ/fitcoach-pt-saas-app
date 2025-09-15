using Microsoft.EntityFrameworkCore;

namespace FitCoach.Infrastructure.Postgres;

public class WorkoutDbContext : DbContext
{
    public WorkoutDbContext(DbContextOptions<WorkoutDbContext> options) : base(options)
    {
    }

    // Placeholder DbSet
    public DbSet<WorkoutSession>? WorkoutSessions { get; set; }
}

public class WorkoutSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public int DurationMinutes { get; set; }
}
