using FitCoach.Common.Messaging;
using FitCoach.UserManagement.Api.Data;
using FitCoach.UserManagement.Api.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var kafkaBootstrap = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
builder.Services.AddSingleton(new KafkaProducer(kafkaBootstrap));
builder.Services.AddHostedService(sp => new KafkaConsumerService(kafkaBootstrap, "managment", "fitcoach-user-consumer"));

// Database
var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? builder.Configuration["Database:DefaultConnection"]
           ?? "Host=localhost;Database=fitcoach;Username=postgres;Password=postgres";

builder.Services.AddDbContext<UserDbContext>(options =>
{
    options.UseNpgsql(conn);
});

builder.Services.AddScoped<IUserRepository, UserRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
