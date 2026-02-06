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
        // First try CredentialJson (for environments where JSON is passed directly)
        // Then fall back to CredentialPath (for file-based credentials)
        var credentialJson = configuration["Firebase:CredentialJson"];
        var credentialPath = configuration["Firebase:CredentialPath"];

        GoogleCredential credential;

        if (!string.IsNullOrEmpty(credentialJson))
        {
            credential = GoogleCredential.FromJson(credentialJson);
        }
        else if (!string.IsNullOrEmpty(credentialPath))
        {
            if (!File.Exists(credentialPath))
            {
                throw new InvalidOperationException($"Firebase credential file not found at: {credentialPath}");
            }
            credential = GoogleCredential.FromFile(credentialPath);
        }
        else
        {
            throw new InvalidOperationException("Firebase credentials missing. Set either Firebase:CredentialJson or Firebase:CredentialPath in configuration");
        }

        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = credential
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
