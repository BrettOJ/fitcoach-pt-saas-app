using FitCoach.Infrastructure.Postgres;
using FitCoach.Common.Messaging;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connection = builder.Configuration.GetConnectionString("Default") ?? "Host=localhost;Database=fitcoach;Username=postgres;Password=postgres";
builder.Services.AddDbContext<WorkoutDbContext>(opt => opt.UseNpgsql(connection));

// Kafka settings
var kafkaBootstrap = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
builder.Services.AddSingleton(new KafkaProducer(kafkaBootstrap));
builder.Services.AddHostedService(sp => new KafkaConsumerService(kafkaBootstrap, "workout", "fitcoach-workout-consumer"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

// Expose Program for integration tests
public partial class Program { }
