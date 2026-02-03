namespace Investica.Models
{
    public class TicketAttachment
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int FileTypeId { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public string Base64Data { get; set; }
        public long? FileSizeBytes { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
