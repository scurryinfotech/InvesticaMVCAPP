using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Investica.Models
{
    public class FontSheet
    {
        [Key]
        public int Id { get; set; }

        // FK CompanyMaster.Id
        public int? CompanyId { get; set; }

        // New / existing columns matching DB and JS
        public string? CRNNo { get; set; }
        [Required]
        public string EntityName { get; set; } = string.Empty;
        [Required]
        public string Address { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? CINNumber { get; set; }

        // Entity details
        public string? EntityType { get; set; }
        public DateTime? DateOfIncorporation { get; set; }
        public string? EntityPan { get; set; }
        public string? NatureOfBusiness { get; set; }

        // Personal details
        public DateTime? DOB { get; set; }
        public string? Gender { get; set; }
        public string? FatherMotherSpouseName { get; set; }
        public string? MaritalStatus { get; set; }

        // Location details
        public string? Area { get; set; }
        public string? Ward { get; set; }
        public string? Zone { get; set; }

        // Business details
        public string? ProductServiceSold { get; set; }

        // Additional details
        public string? ElectricBillNo { get; set; }
        public string? PropertyTaxNo { get; set; }
        public string? SqFt { get; set; }
        public string? OtherDetails { get; set; }

        // Source information
        public string? ClientSource { get; set; }
        // FK Employees.Id
        public int? SourcedByEmpId { get; set; }

        // Documents KYC (bits)
        public bool DocPAN { get; set; }
        public bool DocAadhar { get; set; }
        public bool DocEntity { get; set; }
        public bool DocAddress { get; set; }
        public bool DocBank { get; set; }
        public bool DocPhoto { get; set; }
        public bool DocShop { get; set; }
        public bool DocMDA { get; set; }

        // Cross sell
        public string? CrossSell { get; set; }
        public string? CrossSellDetails { get; set; }

        // Internal
        public string? Comments { get; set; }
        public string? Login { get; set; }
        public string? Password { get; set; }
        public string? InternalDetails { get; set; }

        // Scanned by
        public string? ScannedByName { get; set; }
        public string? ScannedBySign { get; set; }

        // Persons collection (promoters / directors)
        public List<FrontSheetPerson>? Persons { get; set; }

        // Audit fields
        public DateTime? CreatedDate { get; set; }
        // FK Employees.Id
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        // FK Employees.Id
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
