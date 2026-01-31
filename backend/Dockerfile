# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Nightnice.sln ./
COPY src/Nightnice.Api/Nightnice.Api.csproj ./src/Nightnice.Api/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY src/ ./src/

# Build and publish
WORKDIR /src/src/Nightnice.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Copy published files
COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5005

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5005
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5005/health || exit 1

ENTRYPOINT ["dotnet", "Nightnice.Api.dll"]
