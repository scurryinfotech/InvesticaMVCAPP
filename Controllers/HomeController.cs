using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Investica.Models;
using Investica.Repository.Interface;

namespace Investica.Controllers
{
    public class HomeController : Controller
    {
        private readonly IService _service;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IService service, ILogger<HomeController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        public IActionResult Index() => View();
        public IActionResult Dashboard() => View();
        public IActionResult Companies() => View();
        public IActionResult OtherDetails() => View();
        public IActionResult Summary() => View();
        public IActionResult Tickets() => View();
        public IActionResult Invoice() => View();
        public IActionResult Fontsheet() => View();
        public IActionResult Links() => View();
        public IActionResult Renewals() => View();
        public IActionResult MasterData() => View();

        #region Manage Dashboard Data
        [HttpGet("document/{id:int}/data")]
        public async Task<IActionResult> GetDocumentData(int id)
        {
            var bytes = await _service.GetDocumentLogoAsync(id);
            if (bytes == null) return NotFound();
            // attempt to return as image; use octet-stream if content-type unknown
            return File(bytes, "application/octet-stream");
        }

        [HttpGet("tickets")]
        public async Task<IActionResult> GetTicketsApi()
        {
            var list = await _service.GetTicketsAsync();
            return Ok(list);
        }

        [HttpGet("tickets/{id:int}")]
        public async Task<IActionResult> GetTicketByIdApi(int id)
        {
            var item = await _service.GetTicketByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // Create ticket - instrumented with logging to confirm the endpoint is hit
        [HttpPost("tickets")]
        public async Task<IActionResult> CreateTicketApi([FromBody] Ticket t)
        {
            if (t == null)
            {
                _logger.LogWarning("CreateTicketApi called with empty body.");
                return BadRequest("Ticket payload required.");
            }

            try
            {
                _logger.LogInformation("CreateTicketApi called. CompanyId={CompanyId}, LicenseId={LicenseId}, StatusId={StatusId}, CompanyAddressPresent={HasAddress}",
                    t.CompanyId, t.LicenseId, t.StatusId, !string.IsNullOrWhiteSpace(t.CompanyAddress));

                // Ensure CreatedDate if not provided
                t.CreatedDate = t.CreatedDate ?? DateTime.UtcNow;

                var id = await _service.CreateTicketAsync(t);

                if (id <= 0)
                {
                    _logger.LogError("CreateTicketAsync returned 0 for payload: {Payload}", t);
                    return StatusCode(500, "Failed to create ticket.");
                }

                // Return created id and tracking number so client can display/verify
                var result = new
                {
                    id,
                    trackingNumber = t.TrackingNumber
                };

                _logger.LogInformation("Ticket created. Id={Id}, Tracking={Tracking}", id, t.TrackingNumber);

                return CreatedAtAction(nameof(GetTicketByIdApi), new { id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateTicketApi");
                return StatusCode(500, "Server error creating ticket.");
            }
        }

        // Shop category links (GET)
        [HttpGet("shoplinks")]
        public async Task<IActionResult> GetShopLinks()
        {
            var list = await _service.GetShopLinksAsync();
            return Ok(list);
        }

        // Trade category links (GET)
        [HttpGet("tradelinks")]
        public async Task<IActionResult> GetTradeLinks()
        {
            var list = await _service.GetTradeLinksAsync();
            return Ok(list);
        }

        // Roles
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var list = await _service.GetRolesAsync();
            return Ok(list);
        }

        [HttpGet("roles/{id:int}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            var item = await _service.GetRoleByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] RoleMaster m)
        {
            if (m == null) return BadRequest();
            m.CreatedDate = DateTime.UtcNow;
            var id = await _service.CreateRoleAsync(m);
            return CreatedAtAction(nameof(GetRoleById), new { id }, new { id });
        }

        [HttpPut("roles/{id:int}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleMaster m)
        {
            if (m == null) return BadRequest();
            m.Id = id;
            m.ModifiedDate = DateTime.UtcNow;
            var ok = await _service.UpdateRoleAsync(m);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("roles/{id:int}")]
        public async Task<IActionResult> DeleteRole(int id, [FromQuery] int modifiedBy = 1)
        {
            var ok = await _service.SoftDeleteRoleAsync(id, modifiedBy);
            if (!ok) return NotFound();
            return NoContent();
        }

        // Employees
        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var list = await _service.GetEmployeesAsync();
            return Ok(list);
        }

        [HttpGet("employees/{id:int}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            var item = await _service.GetEmployeeByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("employees")]
        public async Task<IActionResult> CreateEmployee([FromBody] Employee e)
        {
            if (e == null) return BadRequest();
            e.CreatedDate = DateTime.UtcNow;
            var id = await _service.CreateEmployeeAsync(e);
            return CreatedAtAction(nameof(GetEmployeeById), new { id }, new { id });
        }

        [HttpPut("employees/{id:int}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] Employee e)
        {
            if (e == null) return BadRequest();
            e.Id = id;
            e.ModifiedDate = DateTime.UtcNow;
            var ok = await _service.UpdateEmployeeAsync(e);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("employees/{id:int}")]
        public async Task<IActionResult> DeleteEmployee(int id, [FromQuery] int modifiedBy = 1)
        {
            var ok = await _service.SoftDeleteEmployeeAsync(id, modifiedBy);
            if (!ok) return NotFound();
            return NoContent();
        }

        // Companies
        [HttpGet("companies")]
        public async Task<IActionResult> GetCompanies([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var list = await _service.GetCompaniesAsync(page, pageSize);
            return Ok(list);
        }

        [HttpGet("companies/{id:int}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var item = await _service.GetCompanyByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("companies")]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyMaster c)
        {
            if (c == null) return BadRequest();
            c.CreatedDate = DateTime.UtcNow;
            var id = await _service.CreateCompanyAsync(c);
            return CreatedAtAction(nameof(GetCompanyById), new { id }, new { id });
        }

        [HttpPut("companies/{id:int}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyMaster c)
        {
            if (c == null) return BadRequest();
            c.Id = id;
            c.ModifiedDate = DateTime.UtcNow;
            var ok = await _service.UpdateCompanyAsync(c);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("companies/{id:int}")]
        public async Task<IActionResult> DeleteCompany(int id, [FromQuery] int modifiedBy = 1)
        {
            var ok = await _service.SoftDeleteCompanyAsync(id, modifiedBy);
            if (!ok) return NotFound();
            return NoContent();
        }

        // License Types
        [HttpGet("licensetypes")]
        public async Task<IActionResult> GetLicenseTypes()
        {
            var list = await _service.GetLicenseTypesAsync();
            return Ok(list);
        }

        [HttpGet("licensetypes/{id:int}")]
        public async Task<IActionResult> GetLicenseTypeById(int id)
        {
            // Service does not expose Get by id for license types; if you need it add a service method.
            // For now return NotImplemented if client requests single item.
            return StatusCode(501);
        }

        [HttpPost("licensetypes")]
        public async Task<IActionResult> CreateLicenseType([FromBody] LicenseTypeMaster t)
        {
            if (t == null) return BadRequest();
            t.CreatedDate = DateTime.UtcNow;
            var id = await _service.CreateLicenseTypeAsync(t);
            return Created("", new { id });
        }

        [HttpPut("licensetypes/{id:int}")]
        public async Task<IActionResult> UpdateLicenseType(int id, [FromBody] LicenseTypeMaster t)
        {
            if (t == null) return BadRequest();
            t.Id = id;
            t.ModifiedDate = DateTime.UtcNow;
            var ok = await _service.UpdateLicenseTypeAsync(t);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("licensetypes/{id:int}")]
        public async Task<IActionResult> DeleteLicenseType(int id, [FromQuery] int modifiedBy = 1)
        {
            var ok = await _service.SoftDeleteLicenseTypeAsync(id, modifiedBy);
            if (!ok) return NotFound();
            return NoContent();
        }

        // Statuses
        [HttpGet("statuses")]
        public async Task<IActionResult> GetStatuses()
        {
            var list = await _service.GetStatusesAsync();
            return Ok(list);
        }

        [HttpGet("statuses/{id:int}")]
        public async Task<IActionResult> GetStatusById(int id)
        {
            // Service does not expose Get by id for statuses; return 501 unless you add service method
            return StatusCode(501);
        }

        [HttpPost("statuses")]
        public async Task<IActionResult> CreateStatus([FromBody] StatusMaster s)
        {
            if (s == null) return BadRequest();
            s.CreatedDate = DateTime.UtcNow;
            var id = await _service.CreateStatusAsync(s);
            return Created("", new { id });
        }

        [HttpPut("statuses/{id:int}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusMaster s)
        {
            if (s == null) return BadRequest();
            s.Id = id;
            s.ModifiedDate = DateTime.UtcNow;
            var ok = await _service.UpdateStatusAsync(s);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("statuses/{id:int}")]
        public async Task<IActionResult> DeleteStatus(int id, [FromQuery] int modifiedBy = 1)
        {
            var ok = await _service.SoftDeleteStatusAsync(id, modifiedBy);
            if (!ok) return NotFound();
            return NoContent();
        }

        #endregion
    }
}
