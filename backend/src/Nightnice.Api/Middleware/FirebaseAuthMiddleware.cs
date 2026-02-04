using System.Security.Claims;
using Nightnice.Api.Auth;

namespace Nightnice.Api.Middleware;

public class FirebaseAuthMiddleware
{
    private readonly RequestDelegate _next;

    public FirebaseAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, FirebaseAuthService firebaseAuth)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

        if (authHeader?.StartsWith("Bearer ") == true)
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            var decodedToken = await firebaseAuth.VerifyTokenAsync(token);

            if (decodedToken != null)
            {
                // Add claims to HttpContext
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                    new Claim(ClaimTypes.Email, decodedToken.Claims.GetValueOrDefault("email")?.ToString() ?? ""),
                    new Claim("firebase_uid", decodedToken.Uid),
                    new Claim("user_type", "firebase")
                };

                var identity = new ClaimsIdentity(claims, "Firebase");
                context.User = new ClaimsPrincipal(identity);
            }
        }

        await _next(context);
    }
}

public static class FirebaseAuthMiddlewareExtensions
{
    public static IApplicationBuilder UseFirebaseAuth(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<FirebaseAuthMiddleware>();
    }
}
