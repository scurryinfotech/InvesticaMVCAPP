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
        public IActionResult Login() => View();
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

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request");

            string email = request.email;
            string password = request.password;

            int? roleId = null;

            if (email == "abiraikath@gmail.com" && password == "Jan@2025")
                roleId = 1; 
            else if (email == "karan.investica@gmail.com" && password == "Jan@2025")
                roleId = 2; 
            else
                return Unauthorized();

            var role = await _service.GetRoleByIdAsync(roleId.Value);

            return Ok(new { role = role.Name });
        }


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

        [HttpPut("tickets/{id:int}")]
        public async Task<IActionResult> UpdateTicketApi(int id, [FromBody] TicketUpdateRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("UpdateTicketApi called with empty body for Id={Id}", id);
                return BadRequest("No data is changed.");
            }

            try
            {
                // Fetch existing ticket
                var existingTicket = await _service.GetTicketByIdAsync(id);
                if (existingTicket == null)
                {
                    _logger.LogWarning("Ticket not found. Id={Id}", id);
                    return NotFound($"Ticket with Id {id} not found.");
                }

                _logger.LogInformation("UpdateTicketApi called for Id={Id}. StatusId={StatusId}",
                    id, request.StatusId);

                // Update only the fields that are provided
                if (request.StatusId.HasValue)
                    existingTicket.StatusId = request.StatusId.Value;

                if (request.CompanyAddress != null)
                    existingTicket.CompanyAddress = request.CompanyAddress;

                if (request.ValidTill.HasValue)
                    existingTicket.ValidTill = request.ValidTill;

                if (request.Description != null)
                    existingTicket.Description = request.Description;

                // Set modification metadata
                existingTicket.ModifiedDate = DateTime.UtcNow;
                existingTicket.ModifiedBy = 1; // TODO: Get from authenticated user

                // Save changes
                var success = await _service.UpdateTicketAsync(existingTicket);

                if (!success)
                {
                    _logger.LogError("UpdateTicketAsync failed for Id={Id}", id);
                    return StatusCode(500, "Failed to update ticket.");
                }

                _logger.LogInformation("Ticket updated successfully. Id={Id}", id);

                return Ok(new
                {
                    id,
                    message = "Ticket updated successfully",
                    modifiedDate = existingTicket.ModifiedDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateTicketApi for Id={Id}", id);
                return StatusCode(500, "Server error updating ticket.");
            }
        }

        // Add this action in the controller (place near the other ticket endpoints)
        [HttpGet("tickets/filter")]
        public async Task<IActionResult> FilterTickets([FromQuery] TicketFilterRequest filter)
        {
            filter ??= new TicketFilterRequest();

            var tickets = await _service.GetTicketsByFilterAsync(filter);

            return Ok(tickets);
        }


        // this is the note section
        [HttpPost("notes")]
        public async Task<IActionResult> CreateNoteApi([FromBody] NoteRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.NoteText))
            {
                _logger.LogWarning("CreateNoteApi called with invalid payload.");
                return BadRequest("Note text is required.");
            }

            try
            {
                // Get userId from claims or session
                var userId = 1; // Implement this based on your auth

                var id = await _service.CreateNoteAsync(request.TicketId, request.NoteText, userId);

                if (id <= 0)
                {
                    _logger.LogError("CreateNoteAsync returned 0 for TicketId={TicketId}", request.TicketId);
                    return StatusCode(500, "Failed to create note.");
                }

                var result = new
                {
                    id,
                    ticketId = request.TicketId,
                    timestamp = DateTime.UtcNow.ToString("g"),
                    noteText = request.NoteText
                };

                _logger.LogInformation("Note created. Id={Id}, TicketId={TicketId}", id, request.TicketId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateNoteApi. TicketId={TicketId}", request.TicketId);
                return StatusCode(500, "Server error creating note.");
            }
        }

        //GetNotByID
        [HttpGet("notes/{id}")]
        public async Task<IActionResult> GetNoteByIdApi(int id)
        {
            try
            {
                var note = await _service.GetNoteByIdAsync(id);
                if (note == null)
                {
                    return NotFound();
                }
                return Ok(note);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving note {Id}", id);
                return StatusCode(500, "Server error retrieving note.");
            }
        }

        // GetNoteTicketNotes By ID

        [HttpGet("note/{ticketId}")]
        public async Task<IActionResult> GetNotesByTicketId(int ticketId)
        {
            try
            {
                var notes = await _service.GetNotesByTicketIdAsync(ticketId);
                if (notes == null)
                    return Ok(new List<object>());
                var result = notes.Select(n => new
                {
                    id = n.Id,
                    ticketId = n.RecordId,
                    noteText = n.NewValue,
                    timestamp = n.CreatedDate,
                    createdBy = n.CreatedBy
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notes for TicketId={TicketId}", ticketId);
                return StatusCode(500, "Server error retrieving notes.");
            }
        }

        // This section is for the Attachments from the ticket
        [HttpGet("ticketattachments")]
        public async Task<IActionResult> GetByTicketIdApi([FromQuery] int ticketId)
        {
            var list = await _service.GetByTicketIdAsync(ticketId);
            return Ok(list);
        }

        // POST /api/ticketattachments
        [HttpPost("ticketattachments")]
        public async Task<IActionResult> SaveApi([FromBody] TicketAttachment attachment)
        {
            if (attachment == null || string.IsNullOrEmpty(attachment.Base64Data))
                return BadRequest("Base64Data is required.");

            if (attachment.TicketId <= 0)
                return BadRequest("TicketId is required.");

            // TODO: replace 1 with real UserId from auth
            attachment.CreatedBy = 1;

            var saved = await _service.SaveAsync(attachment);
            return Ok(saved);
        }

        // GET  /api/ticketattachments/download?id=101
        [HttpGet("ticketattachments/download")]
        public async Task<IActionResult> DownloadApi([FromQuery] int id)
        {
            var file = await _service.DownloadAsync(id);
            if (file == null)
                return NotFound("Attachment not found.");

            return Ok(file);
        }

        // DELETE /api/ticketattachments?id=101
        [HttpDelete("ticketattachments")]
        public async Task<IActionResult> DeleteApi([FromQuery] int id)
        {
            // TODO: replace 1 with real UserId from auth
            await _service.DeleteAsync(id, modifiedBy: 1);
            return Ok();
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
            var licenseType = await _service.GetLicenseTypeByIdAsync(id);

            if (licenseType == null)
                return NotFound($"LicenseType with Id {id} not found.");

            return Ok(licenseType);
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
            var item = await _service.GetStatusByIdAsync(id);

            if (item == null)
                return NotFound($"Status with Id {id} not found.");

            return Ok(item);
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


        #region  Invoce Management

        [HttpGet("invoice/filter")]
        public async Task<IActionResult> FilterInvoice([FromQuery] InvoiceFilterRequest filter)
        {
            filter ??= new InvoiceFilterRequest();

            var Invoice = await _service.GetInvoiceByFilterAsync(filter);

            return Ok(Invoice);
        }

        [HttpGet("invoice")]
        public async Task<IActionResult> GetInvoicesApi()
        {
            try
            {
                var list = await _service.GetInvoicesAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving invoices", error = ex.Message });
            }
        }

        //[HttpGet("invoice/{id:int}")]
        //public async Task<IActionResult> GetInvoiceByIdApi(int id)
        //{
        //    try
        //    {
        //        var invoice = await _service.GetInvoiceByIdAsync(id);

        //        return Ok(invoice);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Error retrieving invoice", error = ex.Message });
        //    }
        //}

        [HttpPost("invoice")]
        public async Task<IActionResult> CreateInvoiceAsync([FromBody] InvoiceModel invoice)
        {
            try
            {
                var invoiceId = await _service.CreateInvoiceAsync(invoice);

                return Ok(invoiceId);

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating invoice", error = ex.Message });
            }
        }

        [HttpPut("invoice/{id:int}")]
        public async Task<IActionResult> UpdateInvoiceAsync(int id, [FromBody] InvoiceModel invoice)
        {
            try
            {
                var result = await _service.UpdateInvoiceAsync(invoice);

                if (result)
                {
                    return Ok(new { message = "Invoice updated successfully" });
                }

                return NotFound(new { message = $"Invoice with ID {id} not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating invoice", error = ex.Message });
            }
        }

        //[HttpDelete("invoice/{id:int}")]
        //public async Task<IActionResult> DeleteInvoiceAsync(int id)
        //{
        //    try
        //    {
        //        var result = await _service.DeleteInvoiceAsync(id);

        //        if (result)
        //        {
        //            return Ok(new { message = "Invoice deleted successfully" });
        //        }

        //        return NotFound(new { message = $"Invoice with ID {id} not found" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Error deleting invoice", error = ex.Message });
        //    }
        //}

        #endregion

        #region

        [HttpGet("renewals")]
        public async Task<IActionResult> GetAllRenewals()
        {
            try
            {
                var renewals = await _service.GetAllWithDetailsAsync();
                return Ok(renewals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching renewals", error = ex.Message });
            }
        }

        
        [HttpPost("renewal")]
        public async Task<IActionResult> CreateRenewal([FromBody] LicenseRenewalRequest request)
        {
            try
            {
                var id = await _service.CreateAsync(request);
                return Ok(new { id, message = "Renewal created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating renewal", error = ex.Message });
            }
        }

        // PUT: api/home/renewal/{id}
        [HttpPut("renewal/{id}")]
        public async Task<IActionResult> UpdateRenewal(int id, [FromBody] LicenseRenewalRequest request)
        {
            try
            {
                var success = await _service.UpdateAsync(id, request);
                if (success)
                {
                    return Ok(new { message = "Renewal updated successfully" });
                }
                return NotFound(new { message = "Renewal not found or update failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating renewal", error = ex.Message });
            }
        }

        // DELETE: api/home/renewal/{id}
        [HttpDelete("renewal/{id}")]
        public async Task<IActionResult> DeleteRenewal(int id)
        {
            try
            {
                var success = await _service.DeleteAsync(id);
                if (success)
                {
                    return Ok(new { message = "Renewal deleted successfully" });
                }
                return NotFound(new { message = "Renewal not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting renewal", error = ex.Message });
            }
        }

        // GET: api/home/renewals/dropdowns
        [HttpGet("renewals/dropdowns")]
        public async Task<IActionResult> GetDropdowns()
        {
            try
            {
                var data = await _service.GetDropdownDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching dropdown data", error = ex.Message });
            }
        }

        //// GET: api/home/renewal/{id}
        [HttpGet("renewal/{id}")]
        public async Task<IActionResult> GetRenewalByIdAsync(int id)
        {
            try
            {
                var renewal = await _service.GetByIdWithDetailsAsync(id);
                if (renewal == null)
                    return NotFound(new { message = "Renewal not found" });

                return Ok(renewal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching renewal", error = ex.Message });
            }
        }

        #endregion


        //Frontsheet Controller
        #region this is the code for the frontsheet

        // Add endpoints near other GET endpoints (for example near renewals dropdown endpoint)
        [HttpGet("entitytypes")]
        public async Task<IActionResult> GetEntityTypes()
        {
            try
            {
                var list = await _service.GetEntityTypesAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching entity types");
                return StatusCode(500, new { message = "Error fetching entity types", error = ex.Message });
            }
        }

        [HttpGet("Frontsheet/dropdowns")]
        public async Task<IActionResult> GetFrontsheetDropdowns()
        {
            try
            {
                var frontsheets = await _service.GetFontSheetsAsync();
                var entityTypes = await _service.GetEntityTypesAsync();
                var companies = await _service.GetCompaniesAsync(page: 1, pageSize: 1000);

                var fsList = frontsheets.Select(fs => new { id = fs.Id, name = fs.EntityName }).ToList();
                var companiesList = companies.Select(c => new { id = c.Id, name = c.CompanyName }).ToList();

                return Ok(new
                {
                    frontsheets = fsList,
                    entityTypes,
                    companies = companiesList
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching frontsheet dropdowns");
                return StatusCode(500, new { message = "Error fetching frontsheet dropdowns", error = ex.Message });
            }
        }
        // GET: api/frontsheet
        [HttpGet("Frontsheet")]
            public async Task<IActionResult> GetAllFrontsheets()
            {
                try
                {
                    var list = await _service.GetFontSheetsAsync();
                    return Ok(new { success = true, data = list });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }

            // GET: api/frontsheet/{id}
            [HttpGet("Frontsheet/{id:int}")]
            public async Task<IActionResult> GetFrontsheetById(int id)
            {
                try
                {
                    var item = await _service.GetFontSheetByIdAsync(id);
                    if (item == null)
                        return NotFound(new { success = false, message = "Frontsheet not found" });

                    return Ok(new { success = true, data = item });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }

            // POST: api/frontsheet
            [HttpPost("Frontsheet")]
            public async Task<IActionResult> CreateFrontsheet([FromBody] FontSheet frontsheet)
            {
                try
                {
                if (frontsheet == null)
                {
                    _logger.LogWarning("CreateFrontsheet called with null body. ModelState errors: {Errors}", ModelState);
                    return BadRequest(new { success = false, message = "Invalid frontsheet payload", errors = ModelState });
                }
                if (!ModelState.IsValid)
                        return BadRequest(new { success = false, message = "Invalid data", errors = ModelState });

                    // Set creation metadata
                    frontsheet.CreatedDate = DateTime.UtcNow;
                    frontsheet.IsActive = true;

                    var newId = await _service.CreateFontSheetAsync(frontsheet);

                    if (newId > 0)
                    {
                        frontsheet.Id = newId;
                        return Ok(new { success = true, message = "Frontsheet created successfully", data = frontsheet });
                    }

                    return StatusCode(500, new { success = false, message = "Failed to create frontsheet" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }

            // PUT: api/frontsheet/{id}
            [HttpPut("Frontsheet/{id:int}")]
            public async Task<IActionResult> UpdateFrontsheet(int id, [FromBody] FontSheet frontsheet)
            {
                try
                {
                    if (id != frontsheet.Id)
                        return BadRequest(new { success = false, message = "ID mismatch" });

                    
             
                    frontsheet.ModifiedDate = DateTime.UtcNow;

                    var result = await _service.UpdateFontSheetAsync(frontsheet);

                    if (result)
                        return Ok(new { success = true, message = "Frontsheet updated successfully", data = frontsheet });

                    return NotFound(new { success = false, message = "Frontsheet not found" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }

            // DELETE: api/frontsheet/{id}
            [HttpDelete("Frontsheet/{id:int}")]
            public async Task<IActionResult> DeleteFrontsheet(int id)
            {
                try
                {
                    var result = await _service.DeleteFontSheetAsync(id);

                    if (result)
                        return Ok(new { success = true, message = "Frontsheet deleted successfully" });

                    return NotFound(new { success = false, message = "Frontsheet not found" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }

            // JS in wwwroot/js/Fontsheet.js calls /Frontsheet/GetAll and /Frontsheet/Create.
        // Add small wrappers so both URL forms work.
             [HttpGet("Frontsheet/GetAll")]
             public Task<IActionResult> GetAllFrontsheets_ViaGetAll() => GetAllFrontsheets();
           
             [HttpPost("Frontsheet/Create")]
             public Task<IActionResult> CreateFrontsheet_ViaCreate([FromBody] FontSheet frontsheet) => CreateFrontsheet(frontsheet);
           
            #endregion

        }
}
