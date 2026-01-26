using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class LicenseTypeMaster
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Unikey { get; set; } = string.Empty;

        [Required]
        public string AppTypeName { get; set; } = string.Empty;

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
