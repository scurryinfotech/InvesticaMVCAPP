using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class InvoiceModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        public string? InvoiceTo { get; set; }
        [Required]
        public string GstNoTo { get; set; } = string.Empty;
        public string? InvoiceToAddress { get; set; }

        public string? InvoiceFrom { get; set; }
        [Required]
        public string GstNoFrom { get; set; } = string.Empty;
        public string? InvoiceFromAddress { get; set; }

        public decimal SubTotal { get; set; }
        public decimal Igst { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal NetTotal { get; set; }
        public string? NetTotalWords { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; } = true;

        // child line items
        public List<InvoiceLineItemModel> LineItems { get; set; } = new();
    }
}
