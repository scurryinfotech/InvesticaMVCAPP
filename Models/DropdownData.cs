namespace Investica.Models
{
    public class DropdownData
    {
        public List<DropdownItem> Companies { get; set; } = new();
        public List<DropdownItem> LicenseTypes { get; set; } = new();
        public List<string> Locations { get; set; } = new();
    }
}
