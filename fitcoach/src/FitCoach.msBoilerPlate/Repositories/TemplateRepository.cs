using FitCoach.msBoilerPlate.Data;
using FitCoach.msBoilerPlate.Models;
using Microsoft.EntityFrameworkCore;

namespace FitCoach.msBoilerPlate.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly TemplateDbContext _db;

    public TemplateRepository(TemplateDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(TemplateEntity entity)
    {
        _db.Items.Add(entity);
        await _db.SaveChangesAsync().ConfigureAwait(false);
    }

    public async Task<TemplateEntity?> GetAsync(Guid id)
    {
        return await _db.Items.FirstOrDefaultAsync(x => x.Id == id).ConfigureAwait(false);
    }
}
