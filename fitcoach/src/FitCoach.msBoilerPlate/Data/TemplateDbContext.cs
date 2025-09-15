using Microsoft.EntityFrameworkCore;
using FitCoach.msBoilerPlate.Models;

namespace FitCoach.msBoilerPlate.Data;

public class TemplateDbContext : DbContext
{
    public TemplateDbContext(DbContextOptions<TemplateDbContext> options) : base(options)
    {
    }

    public DbSet<TemplateEntity> Items { get; set; }
}
