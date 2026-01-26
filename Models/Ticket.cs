using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class Ticket
    {
        [Key]
        public int Id { get; set; }

        // FK CompanyMaster.Id
        public int CompanyId { get; set; }

        // FK Employees.Id
        public int EmployeeId { get; set; }

        // FK LicenseTypeMaster.Id
        public int LicenseId { get; set; }

        // FK StatusMaster.Id
        public int StatusId { get; set; }

        public string? CompanyAddress { get; set; }

        public string? Description { get; set; }

        public string? TrackingNumber { get; set; }

        public DateTime? ValidTill { get; set; }

        public DateTime? CreatedDate { get; set; }

        // FK Employees.Id
        public int? CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        // FK Employees.Id
        public int? ModifiedBy { get; set; }
    }
}
