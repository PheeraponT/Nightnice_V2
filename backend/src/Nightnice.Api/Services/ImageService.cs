namespace Nightnice.Api.Services;

// T115: Image service for handling file uploads
// For MVP, using local storage. Can be extended to R2/S3 later.
public class ImageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageService> _logger;
    private readonly string _uploadPath;

    public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
    {
        _environment = environment;
        _logger = logger;
        _uploadPath = Path.Combine(_environment.ContentRootPath, "uploads");

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        var folderPath = Path.Combine(_uploadPath, folder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(folderPath, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        _logger.LogInformation("Uploaded image to {FilePath}", filePath);

        // Return relative URL path
        return $"/uploads/{folder}/{fileName}";
    }

    public Task<bool> DeleteImageAsync(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        {
            return Task.FromResult(false);
        }

        try
        {
            // Convert URL to file path
            var relativePath = imageUrl.TrimStart('/');
            var filePath = Path.Combine(_environment.ContentRootPath, relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Deleted image at {FilePath}", filePath);
                return Task.FromResult(true);
            }

            _logger.LogWarning("Image file not found at {FilePath}", filePath);
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image at {ImageUrl}", imageUrl);
            return Task.FromResult(false);
        }
    }
}
