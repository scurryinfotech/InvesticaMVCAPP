namespace Investica.Models
{
    public class LicenseRenewal
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int LicenseTypeId { get; set; }
        public string CityState { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public string ExpiryMonth { get; set; } = string.Empty;
        public int ExpiryYear { get; set; }
        public string? Remarks { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
