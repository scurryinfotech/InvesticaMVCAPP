using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class DocumentTable
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public byte[] Logo { get; set; } = Array.Empty<byte>();

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }

        public bool? IsActive { get; set; }
    }
}
