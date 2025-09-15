# FitCoach.msBoilerPlate

This folder is a minimal microservice template for the FitCoach platform. It demonstrates:

- A .NET 8 Web API scaffold
- EF Core (Postgres) DbContext, model and repository pattern
- Kafka integration via `FitCoach.Common` (producer + background consumer)
- Dockerfile for container builds
- Kubernetes manifest (ConfigMap, Deployment, Service)

Quick start
1. Copy the whole `FitCoach.msBoilerPlate` folder and rename the project folder and project file to match your new service name.
2. Update the namespace in code files to your new service namespace (search/replace `FitCoach.msBoilerPlate`).
3. Update `Program.cs` for service-specific Kafka topic names and consumer group.
4. Update the fallback connection string or set `DefaultConnection` in your environment or `appsettings.json`.
5. Build and run locally:

```powershell
cd path\to\YourNewService
dotnet run
```

6. To containerize:

```powershell
docker build -t yourname/yourservice:latest .
docker push yourname/yourservice:latest
```

7. Deploy to Kubernetes (adjust image name and namespace in `k8s/deployment.yaml`):

```powershell
kubectl apply -f k8s/deployment.yaml
```

Notes
- This template keeps messaging and data persistence concerns separated to make the project a good starting point for new microservices.
- Consider adding EF Migrations (`dotnet ef migrations add InitialCreate`) and CI steps to apply DB migrations during deployment.
