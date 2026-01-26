using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class CompanyMaster
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Unikey { get; set; } = string.Empty;

        [Required]
        public string CompanyName { get; set; } = string.Empty;

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }

        // FK DocumentTable.Id
        public int? DocumentId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
