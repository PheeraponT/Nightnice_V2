using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace Nightnice.Api.Auth;

public class FirebaseAuthService
{
    private readonly FirebaseAuth _auth;

    public FirebaseAuthService(IConfiguration configuration)
    {
        // Initialize Firebase Admin SDK
        var credentialJson = configuration["Firebase:CredentialJson"];

        if (string.IsNullOrEmpty(credentialJson))
        {
            throw new InvalidOperationException("Firebase:CredentialJson configuration is missing");
        }

        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromJson(credentialJson)
            });
        }

        _auth = FirebaseAuth.DefaultInstance;
    }

    /// <summary>
    /// Verify Firebase ID token from client
    /// </summary>
    public async Task<FirebaseToken?> VerifyTokenAsync(string idToken)
    {
        try
        {
            var decodedToken = await _auth.VerifyIdTokenAsync(idToken);
            return decodedToken;
        }
        catch (FirebaseAuthException)
        {
            return null;
        }
    }

    /// <summary>
    /// Get user info from Firebase
    /// </summary>
    public async Task<UserRecord?> GetUserAsync(string uid)
    {
        try
        {
            return await _auth.GetUserAsync(uid);
        }
        catch (FirebaseAuthException)
        {
            return null;
        }
    }
}
