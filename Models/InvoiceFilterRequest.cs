using System;

namespace Investica.Models
{
    // Minimal filter DTO used by service/controller filtering endpoints.
    public class InvoiceFilterRequest
    {
        public string? InvoiceNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
