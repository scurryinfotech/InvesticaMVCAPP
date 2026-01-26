namespace Investica.Models
{
    public class UpcomingRenewal
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int LicenseTypeId { get; set; }
        public string? Location { get; set; }
        public DateTime? CurrentExpiryDate { get; set; }
        public DateTime? RenewalDueDate { get; set; }
        public int StatusId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
