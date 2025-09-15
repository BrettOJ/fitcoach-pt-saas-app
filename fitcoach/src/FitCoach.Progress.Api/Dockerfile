# Build stage
ARG TARGETPLATFORM
ARG TARGETARCH
FROM --platform=${TARGETPLATFORM:-linux/amd64} mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "src/FitCoach.Progress.Api/FitCoach.Progress.Api.csproj"
RUN dotnet publish "src/FitCoach.Progress.Api/FitCoach.Progress.Api.csproj" -c Release -o /app/publish

FROM --platform=${TARGETPLATFORM:-linux/amd64} mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "FitCoach.Progress.Api.dll"]
