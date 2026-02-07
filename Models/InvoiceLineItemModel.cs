using System;

namespace Investica.Models
{
    public class InvoiceLineItemModel
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int LineOrder { get; set; }
        // "heading" or "data"
        public string ItemType { get; set; } = string.Empty;

        // For headings
        public string? HeadingText { get; set; }

        // For data rows
        public string? Particulars { get; set; }
        public decimal? GrossAmount { get; set; }
        public decimal? NetAmount { get; set; }

        public DateTime? CreatedDate { get; set; }
    }
}
