namespace Investica.Models
{
    public class LicenseRenewalRequest
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int LicenseTypeId { get; set; }
        public string CityState { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public string? Remarks { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
