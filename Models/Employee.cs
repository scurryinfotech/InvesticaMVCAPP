using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        // FK to RoleMaster.Id
        public int Role { get; set; }

        public DateTime? CreatedDate { get; set; }

        // FK to Employees.Id (nullable for initial seed)
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK to Employees.Id
        public int? ModifiedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
