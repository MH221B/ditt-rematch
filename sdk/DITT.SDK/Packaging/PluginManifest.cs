namespace DITT.SDK.Packaging
{
    /// <summary>
    /// Metadata file inside .mtpkg packages.
    /// Describes the plugin and its contents.
    /// </summary>
    public class PluginManifest
    {
        /// <summary>Plugin name (must match IToolPlugin.Name)</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Semantic version (must match IToolPlugin.Version)</summary>
        public string Version { get; set; } = string.Empty;
        /// <summary>Plugin description</summary>
        public string Description { get; set; } = string.Empty;
        /// <summary>Author/organization name</summary>
        public string Author { get; set; } = string.Empty;
        /// <summary>Is this a premium plugin?</summary>
        public bool IsPremium { get; set; } = false;
        /// <summary>Minimum DITT platform version required</summary>
        public string MinPlatformVersion { get; set; } = "1.0.0";
        /// <summary>Plugin DLL filename inside package</summary>
        public string PluginDll { get; set; } = string.Empty;
        /// <summary>Frontend bundle path (optional)</summary>
        public string? FrontendBundle { get; set; }
        /// <summary>Plugin icon path (optional)</summary>
        public string? Icon { get; set; }
        /// <summary>SHA256 hash of the plugin DLL for integrity check</summary>
        public string DllHash { get; set; } = string.Empty;
        /// <summary>Package creation timestamp</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}