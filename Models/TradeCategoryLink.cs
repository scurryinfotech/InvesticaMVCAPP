using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class TradeCategoryLink
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CorporationName { get; set; } = string.Empty;

        public string? Website { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }
    }
}
