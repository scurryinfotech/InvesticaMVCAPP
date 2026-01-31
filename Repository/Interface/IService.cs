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
        Task<bool> UpdateTicketAsync(Ticket t);
        Task<bool> SoftDeleteTicketAsync(int id, int modifiedBy);
        Task<List<Ticket>> GetTicketsByFilterAsync(TicketFilterRequest filter);

        // UpcomingRenewals
        Task<List<UpcomingRenewal>> GetUpcomingRenewalsAsync();
        Task<int> CreateUpcomingRenewalAsync(UpcomingRenewal r);
        Task<bool> UpdateUpcomingRenewalAsync(UpcomingRenewal r);

        // FontSheet
        Task<List<FontSheet>> GetFontSheetsAsync();
        Task<int> CreateFontSheetAsync(FontSheet f);
        Task<bool> UpdateFontSheetAsync(FontSheet f);

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