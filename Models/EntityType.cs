using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class EntityType

    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }


    }
}
