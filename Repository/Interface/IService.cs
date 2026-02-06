using Investica.Models;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Threading.Tasks;

namespace Investica.Repository.Interface
{
    public interface IService
    {
        // RoleMaster
        Task<List<RoleMaster>> GetRolesAsync();
        Task<RoleMaster?> GetRoleByIdAsync(int id);
        Task<int> CreateRoleAsync(RoleMaster m);
        Task<bool> UpdateRoleAsync(RoleMaster m);
        Task<bool> SoftDeleteRoleAsync(int id, int modifiedBy);

        // Employees
        Task<List<Employee>> GetEmployeesAsync();
        Task<Employee?> GetEmployeeByIdAsync(int id);
        Task<int> CreateEmployeeAsync(Employee e);
        Task<bool> UpdateEmployeeAsync(Employee e);
        Task<bool> SoftDeleteEmployeeAsync(int id, int modifiedBy);

        // DocumentTable
        Task<int> CreateDocumentAsync(string name, byte[] logo, int createdBy);
        Task<byte[]?> GetDocumentLogoAsync(int id);

        // CompanyMaster
        Task<List<CompanyMaster>> GetCompaniesAsync(int page = 1, int pageSize = 100);
        Task<CompanyMaster?> GetCompanyByIdAsync(int id);
        Task<int> CreateCompanyAsync(CompanyMaster c);
        Task<bool> UpdateCompanyAsync(CompanyMaster c);
        Task<bool> SoftDeleteCompanyAsync(int id, int modifiedBy);

        // LicenseTypeMaster
        Task<List<LicenseTypeMaster>> GetLicenseTypesAsync();
        Task<LicenseTypeMaster?> GetLicenseTypeByIdAsync(int id);
        Task<int> CreateLicenseTypeAsync(LicenseTypeMaster t);
        Task<bool> UpdateLicenseTypeAsync(LicenseTypeMaster t);
        Task<bool> SoftDeleteLicenseTypeAsync(int id, int modifiedBy);

        // StatusMaster
        Task<List<StatusMaster>> GetStatusesAsync();
        Task<StatusMaster?> GetStatusByIdAsync(int id);
        Task<int> CreateStatusAsync(StatusMaster s);
        Task<bool> UpdateStatusAsync(StatusMaster s);
        Task<bool> SoftDeleteStatusAsync(int id, int modifiedBy);

        // Tickets
        Task<List<Ticket>> GetTicketsAsync();
        Task<Ticket?> GetTicketByIdAsync(int id);
        Task<int> CreateTicketAsync(Ticket t);
        //Task<bool> UpdateTicketAsync(Ticket t);        this is the  old one which is working before update new Iservice
        Task<bool> SoftDeleteTicketAsync(int id, int modifiedBy);
        Task<List<Ticket>> GetTicketsByFilterAsync(TicketFilterRequest filter);
        Task<int> CreateNoteAsync(int ticketId, string noteText, int userId);
        Task<List<Log>> GetNotesByTicketIdAsync(int ticketId);
        Task<Log> GetNoteByIdAsync(int id);
        Task<bool> UpdateTicketAsync(Ticket ticket);

        // This section is for the Attachments 
        Task<List<TicketAttachment>> GetByTicketIdAsync(int ticketId);
        Task<TicketAttachment> SaveAsync(TicketAttachment attachment);
        Task<TicketAttachmentDownload> DownloadAsync(int id);
        Task DeleteAsync(int id, int modifiedBy);

        // UpcomingRenewals
        Task<List<UpcomingRenewalDto>> GetAllWithDetailsAsync();
        Task<UpcomingRenewalDto?> GetByIdWithDetailsAsync(int id);
        Task<int> CreateAsync(LicenseRenewalRequest request);
        Task<bool> UpdateAsync(int id, LicenseRenewalRequest request);
        Task<bool> DeleteAsync(int id);
        Task<DropdownData> GetDropdownDataAsync();

        // helper used in duplicate renewal endpoint
        //Task<List<UpcomingRenewalDto>> GetUpcomingRenewalsAsync();


        // FontSheet
        Task<List<FontSheet>> GetFontSheetsAsync();
        Task<FontSheet?> GetFontSheetByIdAsync(int id);
        Task<int> CreateFontSheetAsync(FontSheet f);
        Task<bool> UpdateFontSheetAsync(FontSheet f);
        Task<bool> DeleteFontSheetAsync(int id);
        Task<List<DropdownItem>> GetEntityTypesAsync();
        // ShopCategoryLinks                                           
        Task<List<ShopCategoryLink>> GetShopLinksAsync();
        Task<int> CreateShopLinkAsync(ShopCategoryLink s);
        Task<bool> UpdateShopLinkAsync(ShopCategoryLink s);

        // TradeCategoryLinks
        Task<List<TradeCategoryLink>> GetTradeLinksAsync();
        Task<int> CreateTradeLinkAsync(TradeCategoryLink t);
        Task<bool> UpdateTradeLinkAsync(TradeCategoryLink t);

        // Invoice
        Task<List<InvoiceModel>> GetInvoiceByFilterAsync(InvoiceFilterRequest filter);
        Task<List<InvoiceModel>> GetInvoicesAsync();
        Task<int> CreateInvoiceAsync(InvoiceModel inv);
        Task<bool> UpdateInvoiceAsync(InvoiceModel inv);
        //Task<List<InvoiceModel>> GetInvoiceByIdAsync(int id);
        //Task<bool> GetInvoiceByIdAsync(int id);

       
    }
}