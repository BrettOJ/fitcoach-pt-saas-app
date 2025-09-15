# Build stage
# Allow buildx to set the target platform (e.g. linux/arm64)
ARG TARGETPLATFORM
ARG TARGETARCH
FROM --platform=${TARGETPLATFORM:-linux/amd64} mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy everything and build
COPY . .

RUN dotnet restore "src/FitCoach.Workout.Api/FitCoach.Workout.Api.csproj"
RUN dotnet publish "src/FitCoach.Workout.Api/FitCoach.Workout.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM --platform=${TARGETPLATFORM:-linux/amd64} mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "FitCoach.Workout.Api.dll"]
