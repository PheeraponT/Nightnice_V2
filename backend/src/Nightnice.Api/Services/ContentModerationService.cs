using System.Collections.ObjectModel;

namespace Nightnice.Api.Services;

public record ModerationResult(bool IsClean, string? Field = null, string? Term = null);

public class ContentModerationService
{
    private static readonly string[] DefaultBlockedTerms =
    [
        "fuck", "shit", "bitch", "bastard", "asshole", "dick", "pussy",
        "ควย", "เหี้ย", "สัส", "เชี่ย", "แม่ง", "หี", "เย็ด", "ส้นตีน", "พ่อง",
        "กระแดะ", "อีดอก", "เงี่ยน"
    ];

    private readonly ReadOnlyCollection<string> _blockedTerms;

    public ContentModerationService()
    {
        _blockedTerms = Array.AsReadOnly(DefaultBlockedTerms);
    }

    public ModerationResult AnalyzeFields(Dictionary<string, string?> fields)
    {
        foreach (var (field, value) in fields)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            var normalized = Normalize(value);
            foreach (var blocked in _blockedTerms)
            {
                if (normalized.Contains(blocked, StringComparison.OrdinalIgnoreCase))
                {
                    return new ModerationResult(false, field, blocked);
                }
            }
        }

        return new ModerationResult(true);
    }

    private static string Normalize(string input)
    {
        return input
            .ToLowerInvariant()
            .Replace(Environment.NewLine, " ")
            .Trim();
    }
}
