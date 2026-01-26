using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class FontSheet
    {
        [Key]
        public int Id { get; set; }

        // FK CompanyMaster.Id
        public int? CompanyId { get; set; }

        [Required]
        public string EntityName { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? PromoterNameAddress { get; set; }

        public string? EntityType { get; set; }

        public string? NatureOfBusiness { get; set; }

        public string? PanAadhar { get; set; }

        public string? EntityPan { get; set; }

        public DateTime? DOB { get; set; }

        public string? Gender { get; set; }

        public string? MaritalStatus { get; set; }

        public string? FatherMotherSpouseName { get; set; }

        public string? Area { get; set; }

        public string? Ward { get; set; }

        public string? Zone { get; set; }

        public string? ProductServiceSold { get; set; }

        public string? ClientSource { get; set; }

        // FK Employees.Id
        public int? SourcedByEmpId { get; set; }

        public string? Comments { get; set; }

        public string? Login { get; set; }

        public string? Password { get; set; }

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
