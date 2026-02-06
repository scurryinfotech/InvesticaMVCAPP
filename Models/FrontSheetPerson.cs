namespace Investica.Models
{
    public class FrontSheetPerson
    {
        public int Id { get; set; }
        public int FrontSheetId { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? PAN { get; set; }
        public string? Aadhar { get; set; }
        public int? DisplayOrder { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
