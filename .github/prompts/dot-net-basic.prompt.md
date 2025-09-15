---
mode: agent
tools: ['codebase', 'problems', 'changes', 'findTestFiles', 'githubRepo', 'editFiles', 'runNotebooks', 'search', 'runCommands', 'runTasks']
description: '
  Create a .NET microservice solution following best practices. Include web and API layers, Kafka producer/consumer components, Postgres and SQL Server connectors, and layers for testing, logging, and security. The entire solution should be generated based on this prompt.'
---

You are a senior .NET architect. Generate a complete, runnable .NET **8** microservice solution that includes a Web/API, Kafka messaging (producer & consumer), data access for PostgreSQL, automated tests, structured logging, security, and observability. Favor clean, dependency-injected design and .NET idioms. also include a Dockerfiles for building the microservices and a brief runbook. The application will be used for a fitness coaching SaaS platform. Start with initial three microservices that are used for user management, workout tracking, and progress analytics. The application should include a frontend web app build with React The application should be production-ready, following best practices for configuration, error handling, and resilience.

# Inputs
- **solution_dir**: ${input:solution_dir:Relative folder for the new solution (e.g., ./services/FitCoach.Catalog)}
- **service_name**: ${input:service_name:Solution/namespace root (e.g., FitCoach.Catalog)}
- **db_provider**: ${input:db_provider:(postgres|sqlserver)}
- **kafka_topics**: ${input:kafka_topics:Comma-separated topics}

# Workspace & Path Rules
- Treat **${solution_dir}** as the root of the new solution. If it doesn’t exist, create it.
- Initialize the solution **inside** ${solution_dir} and place all projects under `${solution_dir}/src` and tests under `${solution_dir}/tests`.
- When you show code, use **titled code blocks with relative paths under ${solution_dir}**, e.g.
  ```csharp title=${solution_dir}/src/${service_name}.Api/Program.cs
  // ...

###  High-level architecture
- Create a solution that can serve both HTTP-based web/UI layer (e.g. minimal Web API or MVC) and API controllers.
- Include a domain or core layer for business logic.

### Web & API Layers
- Scaffold the web layer with proper routing, controllers, and dependency injection.
- Implement RESTful API endpoints adhering to clean design and separation of concerns.

### Kafka integration
- Add a Kafka producer component that can publish domain events to a Kafka topic.
- Include a Kafka consumer component that subscribes to a separate topic and handles incoming messages.
- Use appropriate .NET Kafka library (e.g. Confluent.Kafka) with configuration options.

### Database connectors
- Include connectors or repositories for both PostgreSQL and SQL Server (via Entity Framework Core or similar).
- Implement database context, repository patterns, migrations, and connection string configuration for both DB types.

### Testing
- Provide a testing layer with unit tests for domain logic.
- Add integration tests for API controllers and Kafka interactions; mock external dependencies.

### Logging
- Integrate structured logging across all layers (e.g. using Microsoft.Extensions.Logging or Serilog).
- Ensure logs include context—web requests, domain events, Kafka messages, database operations.

### Security
- Add authentication and authorization to API endpoints (e.g. JWT bearer token or ASP.NET Core Identity).
- Apply validation and error handling (global error filter or middleware) to secure APIs.

### Additional considerations
- Use a clean, layered folder and namespace structure but don’t explicitly list folders/files—allow Copilot to derive it.
- Use dependency injection for all services and components.
- Make configuration flexible (e.g. appsettings.json with environment overrides).
- Use modern .NET version (e.g. .NET 8) conventions and recommended tooling, but let Copilot infer specifics.
- Write code in C#, following idiomatic .NET coding standards.

Start generating the solution: scaffold the project, continue building out layers and components—don’t wait for further prompts—until a complete, working solution is defined with sample implementations for key components (e.g. a sample controller, a sample Kafka handler, a sample DB repository, one test, one logging example, and one secured endpoint).

