using System;
using System.Text;
using BikeSense.Api.Core.Interfaces;
using BikeSense.Api.Core.Services;
using BikeSense.Api.Infrastructure.Data;
using BikeSense.Api.Infrastructure.Repositories;
using BikeSense.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration with Fallback
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<BikeSenseDbContext>(options =>
        options.UseSqlServer(connectionString));
    Console.WriteLine("Database configured: SQL Server");
}
else
{
    builder.Services.AddDbContext<BikeSenseDbContext>(options =>
        options.UseInMemoryDatabase("BikeSenseProdDb"));
    Console.WriteLine("Database configured: In-Memory (Fallback)");
}

// 2. Repository & Services Dependency Injection
builder.Services.AddScoped<IBikeRepository, BikeRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Register Http Client configuration for Python ML service calls
var mlServiceBaseUrl = builder.Configuration["MlService:BaseUrl"] ?? "http://localhost:8000/";

builder.Services.AddHttpClient<IValuationService, ValuationService>(client =>
{
    client.BaseAddress = new Uri(mlServiceBaseUrl);
});

builder.Services.AddHttpClient("MlServiceClient", client =>
{
    client.BaseAddress = new Uri(mlServiceBaseUrl);
});

// 3. JWT Authentication Setup
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_long_key_for_bikesense_platform_development_secret_key";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BikeSense";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BikeSenseClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Swagger Generation with JWT Bearer Security Spec
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BikeSense AI API Core", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

// CORS Config
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
});

var app = builder.Build();

// 5. Seed Core Roles & Initial Listings Data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BikeSenseDbContext>();
    if (!string.IsNullOrEmpty(connectionString))
    {
        // Apply pending EF Core migrations against SQL Server
        context.Database.Migrate();
    }
    else
    {
        // InMemory provider doesn't support migrations; EnsureCreated applies
        // the OnModelCreating seeds (e.g. Roles) directly.
        context.Database.EnsureCreated();
    }

    // Seed initial users and bikes if DB is empty
    DbInitializer.SeedData(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || true) // Enable swagger globally for prototype accessibility
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BikeSense AI API Core v1");
        c.RoutePrefix = "swagger"; // Exposed at /swagger root
    });
}

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Serve the built Angular frontend (copied into wwwroot at image build time)
// and fall back to index.html for client-side routes that aren't API calls.
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();
