---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'problems', 'search']
description: 'Scaffold a production-grade .NET microservice (Web/API + Kafka + PostgreSQL/SQL Server) with tests, logging, security, and observability. Generate full, runnable code—not placeholders.'
---

# Role

You are a senior .NET architect. Generate a complete, runnable .NET **8** microservice solution that includes a Web/API, Kafka messaging (producer & consumer), data access for PostgreSQL, automated tests, structured logging, security, and observability. Favor clean, dependency-injected design and .NET idioms. also include a Dockerfiles for building the microservices and a brief runbook. The application will be used for a fitness coaching SaaS platform. Start with initial three microservices that are used for user management, workout tracking, and progress analytics. The application should include a frontend web app build with React The application should be production-ready, following best practices for configuration, error handling, and resilience.

# Inputs
- **solution_dir**: ${input:solution_dir:Relative folder for the new solution (e.g., ./services/FitCoach.Catalog)}
- **service_name**: ${input:service_name:Name for the microservice (e.g., FitCoach.Catalog)}
- **api_style**: ${input:api_style:Minimal API or Controller-based? (minimal|controller)}
- **db_provider**: ${input:db_provider:Choose database provider (postgres|sqlserver)}
- **kafka_topics**: ${input:kafka_topics:Comma-separated topics (e.g., catalog.events,catalog.commands)}
- **domain_model**: ${input:domain_model:Brief domain entities & key operations (1–3 sentences)}
- **auth_mode**: ${input:auth_mode:JWT bearer or no-auth for now? (jwt|none)}
- **features**: ${input:features:Optional flags: otel, serilog, testcontainers, docker, compose (comma-separated)}
- **namespace_root**: ${input:namespace_root:Base namespace (default to service_name if blank)}

# Workspace & Path Rules
- Treat **${solution_dir}** as the root of the new solution. If it doesn’t exist, create it.
- Initialize the solution **inside** ${solution_dir} and place all projects under `${solution_dir}/src` and tests under `${solution_dir}/tests`.
- When you show code, use **titled code blocks with relative paths under ${solution_dir}**, e.g.
  ```csharp title=${solution_dir}/src/${service_name}.Api/Program.cs
  // ...

# Goal

Produce a full, working solution with:
- A Web/API project exposing REST endpoints for the provided **domain_model**.
- A Kafka **producer** (for emitting domain events) and **consumer** (processing a subscribed topic) using **Confluent.Kafka**.
- Data access via **EF Core 8** with the selected **db_provider** (Npgsql for Postgres, Microsoft.Data.SqlClient for SQL Server).
- Unit tests and minimal integration tests.
- Structured logging (Serilog), health checks, OpenAPI/Swagger, and (optionally) **OpenTelemetry** metrics/traces.
- Optional **Testcontainers**-powered integration tests if requested in **features**.
- **Security**: optional JWT bearer auth with role/policy example; input validation; CORS.
- **Dev UX**: `Dockerfile` (and optional `docker-compose` if feature `compose`), sample `appsettings`, and a short runbook.

# Constraints & Style

- Target **.NET 8**. Use the **generic host** with DI, configuration, and `IOptions<T>`.
- **Do NOT** print a folder tree. Let Copilot choose a clean multi-project layout (e.g., `src/` and `tests/`). Use consistent names based on **service_name**.
- Write **complete code** (no TODOs or stubs). Include real implementations for API handlers/controllers, Kafka producer/consumer, DbContext, migrations scaffolding hints, and tests.
- Prefer minimal external dependencies beyond: `Confluent.Kafka`, `Serilog.AspNetCore`, `Serilog.Sinks.Console`, `Swashbuckle.AspNetCore`, `OpenTelemetry.Extensions.Hosting` (if `otel`), `OpenTelemetry.Exporter.OTLP` (optional), `Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL` or `Microsoft.EntityFrameworkCore.SqlServer`, `xunit`, `FluentAssertions`, `Microsoft.AspNetCore.Mvc.Testing`, and `DotNet.Testcontainers` (if `testcontainers`).
- Use **environment variables** for secrets (connection strings, JWT settings, Kafka brokers). Add sensible defaults in `appsettings.Development.json`.
- Emit **code blocks for every generated file** with appropriate language fences and a helpful `title=` hint (to simplify saving) but **do not** include a separate file tree section.

# Architecture

- **API Layer**  
  - If `api_style=minimal`: Map endpoints with clear route groups (e.g., `/api/v1/items`).  
  - If `api_style=controller`: Use attribute routing in a thin controller; push logic to services.
  - Add **Swagger** with annotations and proper `Produces`/`Consumes`.

- **Domain / Application**  
  - Define domain entities and DTOs derived from **domain_model**.  
  - Add services for domain operations; keep controllers/handlers thin.

- **Data Access (EF Core 8)**  
  - A single `DbContext` configured by **db_provider** (switch provider by configuration).  
  - Migrations enabled; include an initial migration script in the output.  
  - Demonstrate repository/Unit-of-Work only if it adds value; otherwise use `DbContext` directly with query spec methods.  
  - Include a transactional sample (e.g., create entity → publish Kafka event only after successful save).

- **Messaging (Kafka)**  
  - Library: **Confluent.Kafka**.  
  - **Producer**: wrapper service with `ProduceAsync<TValue>` using topic(s) from **kafka_topics**; configure Avro/JSON serialization (use JSON by default).  
  - **Consumer**: `BackgroundService` with graceful shutdown, at-least-once semantics, retry with backoff, and **DLQ** topic pattern (e.g., `${topic}.dlq`).  
  - Include observability hooks (logging + optional OTel spans) around produce/consume loops.

- **Security**  
  - If `auth_mode=jwt`: add `AddAuthentication().AddJwtBearer(...)`; read issuer/audience from env; include an example `[Authorize(Policy = "CanRead")]`.  
  - Add **input validation** (FluentValidation or manual) and **model binding** error handling.  
  - Configure **CORS** for local dev.

- **Observability**  
  - **Serilog** for structured logs with request logging middleware and correlation IDs.  
  - **Health checks**: `/health/ready` and `/health/live` (check DB + Kafka connectivity on ready).  
  - **OpenTelemetry** (if `otel`): traces + metrics; OTLP exporter configurable via env.

- **Testing**  
  - **Unit tests** with xUnit + FluentAssertions.  
  - **WebApplicationFactory**-based API tests (in-memory or `TestServer`).  
  - **Testcontainers** (if `testcontainers`) to spin up Kafka and the chosen DB for integration tests; seed minimal data; assert end-to-end behavior.

# Implementation Requirements

## Configuration

- Read `KAFKA_BOOTSTRAP_SERVERS`, `DB_CONNECTION_STRING`, `JWT_AUTHORITY`, `JWT_AUDIENCE`, `OTEL_EXPORTER_OTLP_ENDPOINT`, etc.  
- Provide `appsettings.json` + `appsettings.Development.json` with safe defaults; environment variables override.

## Kafka

- Producer uses `deliveryHandler` to log delivery status.  
- Consumer uses `Consume` loop with cooperative cancellation, manual commit post-success, exponential backoff retries, and a DLQ publish on final failure.  
- Include topic creation hints in runbook (CLI examples), but **do not** rely on auto-create.

## Data

- Implement `DbContext` with entity configurations (keys, indexes, required fields).  
- Add an initial migration script and instructions to apply via `dotnet ef` (see Runbook).  
- Show a sample query endpoint with pagination & filtering.

## API

- Endpoints (at least): health, list/get/create/update/delete of the main entity, and an endpoint that **publishes a Kafka event**.  
- OpenAPI doc exposes schemas and example payloads.  
- Return standard problem details on errors.

## Security & Hardening

- Basic rate limiting using `Microsoft.AspNetCore.RateLimiting`.  
- Validate inputs; return 400 with detailed errors.  
- Log only non-sensitive data; never log secrets.

# Quality Gates

- The solution builds with `dotnet build` without warnings-as-errors failing.  
- `dotnet test` passes for unit & integration tests.  
- `curl` against the API works for public endpoints; authorized endpoints require a JWT when `auth_mode=jwt`.  
- Health endpoints report correctly; producing and consuming a test message works (integration test or manual).

# Output Format

- Provide **all code** required to compile and run, including `*.csproj` content, `Program.cs`, DI registrations, Kafka services, `DbContext` + entity configs, test projects, `Dockerfile`, optional `docker-compose`, and minimal `README` with run steps.
- Use **language fences with titles**, for example:
  - ```csharp title=Program.cs
    // ...
    ```
  - ```xml title=ServiceName.Api.csproj
    // ...
    ```
- **Do not** include a separate “file tree” section. Let the structure emerge from the titled code blocks.

# Runbook (include at end of output)

Provide a concise section with:
1. **Build & Run (local)**: `dotnet build`, `dotnet run` commands.  
2. **Environment**: example `KAFKA_BOOTSTRAP_SERVERS`, DB connection strings for Postgres/SQL Server.  
3. **EF Core**: commands to add/apply migrations for the selected provider.  
4. **Kafka**: sample CLI to create topics & send a test message.  
5. **Docker**: build/run the image; if `compose` enabled, show `docker compose up` workflow.  
6. **Smoke Tests**: example `curl` requests including an authenticated call if `auth_mode=jwt`.

# Idempotency

If re-run with the same **service_name**, update and correct prior output instead of duplicating. Prefer deterministic naming and configuration.
