namespace DITT.SDK;

/// <summary>
/// Standardized response wrapper for tool API endpoints.
/// Ensures consistent response shape across all tools.
/// </summary>
public class ToolResponse<T>
{
    /// <summary>Whether the operation succeeded.</summary>
    public bool Success { get; init; }

    /// <summary>The result payload.</summary>
    public T? Data { get; init; }

    /// <summary>Error message if Success is false.</summary>
    public string? Error { get; init; }

    /// <summary>UTC timestamp of the response.</summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>Create a successful response.</summary>
    public static ToolResponse<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    /// <summary>Create a failed response.</summary>
    public static ToolResponse<T> Fail(string error) => new()
    {
        Success = false,
        Error = error
    };
}