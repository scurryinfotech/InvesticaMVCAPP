namespace Investica.Models
{
    public class TicketFilterRequest
    {
        public int? CompanyId { get; set; }
        public int? LicenseType { get; set; }
        public int? Status { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

    }
}
