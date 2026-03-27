using DITT.Core.Models;
using DITT.SDK;

namespace DITT.PluginLoader
{
    public class PluginValidator
    {
        private readonly IEnumerable<string> _loadedPluginNames;

        public PluginValidator(IEnumerable<string> loadedPluginNames)
        {
            _loadedPluginNames = loadedPluginNames;
        }

        public ValidationResult Validate(string ddlPath)
        {
            var errors = new List<string>();
            var warnings = new List<string>();

            // Check if the file exists
            if (!File.Exists(ddlPath))
            {
                errors.Add($"DLL file not found at path: {ddlPath}");
                return new ValidationResult { IsValid = false, Errors = errors };
            }

            // Check if the file is a DLL file
            if (Path.GetExtension(ddlPath)?.ToLower() != ".dll")
            {
                errors.Add("The specified file is not a DLL.");
                return new ValidationResult { IsValid = false, Errors = errors };
            }

            // Try loading and inspecting the assembly
            PluginLoadContext? tempContext = null;
            try
            {
                tempContext = new PluginLoadContext(ddlPath);
                var assembly = tempContext.LoadFromAssemblyPath(ddlPath);

                // Check if plugin has IToolPlugin implementation
                var pluginTypes = assembly.GetTypes()
                    .Where(t => typeof(IToolPlugin).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
                    .ToList();
                
                if (pluginTypes.Count == 0)
                    errors.Add("No class implementing IToolPlugin was found in the assembly.");
                else if (pluginTypes.Count > 1)
                    warnings.Add("Multiple classes implementing IToolPlugin were found. Only the first one will be loaded.");

                if  (pluginTypes.Count > 0)
                {
                    var pluginType = pluginTypes.First();
                    //  Check if exist parameterless constructor
                    if (pluginType.GetConstructor(Type.EmptyTypes) == null)
                        errors.Add($"The plugin class '{pluginType.FullName}' does not have a parameterless constructor.");
                    
                    // Check if plugin is already loaded
                    var tempInstance = Activator.CreateInstance(pluginType) as IToolPlugin;
                    if (tempInstance != null && _loadedPluginNames.Contains(tempInstance.Name))
                        errors.Add($"A plugin with the name '{tempInstance.Name}' is already loaded.");
                }
            }
            catch (BadImageFormatException)
            {
                errors.Add("The specified file is not a valid .NET assembly.");
            }
            catch (Exception ex)
            {
                errors.Add($"An error occurred while validating the plugin: {ex.Message}");
            }
            finally
            {
                // Unload the temporary context to free resources
                tempContext?.Unload();
            }
            return new ValidationResult 
            {  
                IsValid = errors.Count == 0, 
                Errors = errors, 
                Warnings = warnings 
            };
        }
    }
}