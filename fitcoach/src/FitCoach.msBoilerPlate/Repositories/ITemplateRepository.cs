using FitCoach.msBoilerPlate.Models;

namespace FitCoach.msBoilerPlate.Repositories;

public interface ITemplateRepository
{
    Task AddAsync(TemplateEntity entity);
    Task<TemplateEntity?> GetAsync(Guid id);
}
