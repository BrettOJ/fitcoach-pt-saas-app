using System.Net;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FitCoach.Workout.UnitTests;

public class WorkoutApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public WorkoutApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Get_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/workout");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }
}
