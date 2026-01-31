using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nightnice.Api.Auth;
using Nightnice.Api.Data;
using Nightnice.Api.Data.Repositories;
using Nightnice.Api.Endpoints;
using Nightnice.Api.Middleware;
using Nightnice.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

// Database
builder.Services.AddDbContext<NightniceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<SeedDataService>();
builder.Services.AddScoped<StoreService>();
builder.Services.AddScoped<ContactService>();
builder.Services.AddScoped<AdService>();
builder.Services.AddScoped<AdMetricService>();
builder.Services.AddScoped<AdminAuthService>();
builder.Services.AddScoped<ImageService>();

// Repositories
builder.Services.AddScoped<StoreRepository>();
builder.Services.AddScoped<ProvinceRepository>();
builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<AdRepository>();

// Validators
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// JWT Authentication
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// T169: Response caching
builder.Services.AddResponseCaching();
builder.Services.AddOutputCache(options =>
{
    // Default policy - cache for 60 seconds
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromSeconds(60)));

    // Longer cache for static data (provinces, categories)
    options.AddPolicy("StaticData", builder =>
        builder.Expire(TimeSpan.FromMinutes(30)).Tag("static-data"));

    // Short cache for store listings
    options.AddPolicy("StoreList", builder =>
        builder.Expire(TimeSpan.FromMinutes(2)).Tag("store-list"));

    // No cache for admin endpoints
    options.AddPolicy("NoCache", builder => builder.NoCache());
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Nightnice API",
        Version = "v1",
        Description = "Thailand Nightlife Directory API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Error handling middleware
app.UseErrorHandling();

// CORS
app.UseCors();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// T169: Response caching
app.UseResponseCaching();
app.UseOutputCache();

// Apply migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<NightniceDbContext>();
    await dbContext.Database.MigrateAsync();

    var seedService = scope.ServiceProvider.GetRequiredService<SeedDataService>();
    await seedService.SeedAsync();
}

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithOpenApi();

// API Version endpoint
app.MapGet("/api", () => Results.Ok(new { version = "1.0.0", name = "Nightnice API" }))
    .WithName("ApiInfo")
    .WithOpenApi();

// Serve static files (for uploaded images)
app.UseStaticFiles();

// Serve uploaded files from /uploads path
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Map API Endpoints
app.MapStoreEndpoints();
app.MapProvinceEndpoints();
app.MapCategoryEndpoints();
app.MapContactEndpoints();
app.MapAdvertisementEndpoints();
app.MapAdminEndpoints();

app.Run();
