using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class ShopCategoryLink
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StateName { get; set; } = string.Empty;

        public string? Url { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }
    }
}
