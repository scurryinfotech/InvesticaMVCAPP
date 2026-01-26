using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class InvoiceModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string InvoiceNumber { get; set; } = string.Empty;

        public string? InvoiceTo { get; set; }

        [Required]
        public string GstNoTo { get; set; } = string.Empty;

        public string? InvoiceFrom { get; set; }

        [Required]
        public string GstNoFrom { get; set; } = string.Empty;

        public string? Particulars { get; set; }

        [Required]
        public string GrossAmoutRs { get; set; } = string.Empty;

        [Required]
        public string NetAmoutRsm { get; set; } = string.Empty;

        [Required]
        public string SubTotal { get; set; } = string.Empty;

        public int IGST { get; set; }

        [Required]
        public string NetTotal { get; set; } = string.Empty;

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
