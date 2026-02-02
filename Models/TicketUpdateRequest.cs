namespace Investica.Models
{
    public class TicketUpdateRequest
    {
        public int? StatusId { get; set; }
        public string CompanyAddress { get; set; }
        public DateTime? ValidTill { get; set; }
        public string Description { get; set; }
    }
}
