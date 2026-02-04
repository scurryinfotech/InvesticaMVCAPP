namespace Investica.Models
{
    public class UpcomingRenewalDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Unikey { get; set; } = string.Empty;

        public int LicenseTypeId { get; set; }
        public string LicenseType { get; set; } = string.Empty;

        // Location
        public string CityState { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        // Expiry Details
        public DateTime ExpiryDate { get; set; }
        public string ExpiryDateFormatted { get; set; } = string.Empty; // "15-Mar-2025"
        public string ExpiryMonth { get; set; } = string.Empty;
        public int ExpiryYear { get; set; }

        // Status (calculated)
        public string Status { get; set; } = string.Empty; // URGENT, DUE SOON, PENDING
        public int DaysUntilExpiry { get; set; }

        // Additional
        public string? Remarks { get; set; }
        public bool IsActive { get; set; }

        // Audit fields
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
