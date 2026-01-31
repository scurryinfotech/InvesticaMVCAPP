const API_BASE = "/invoice";
let invoicesData = {}; // Store all invoice data
let allInvoices = []; // Store all invoices for filtering

function loadInvoices() {
    $.ajax({
        url: API_BASE,
        method: "GET",
        success: function (data) {
            console.log("Invoices:", data);

            if (data && data.length > 0) {
                // Store all invoices
                allInvoices = data;

                // Store invoice data for later use
                data.forEach(invoice => {
                    invoicesData[invoice.id ?? invoice.Id] = invoice;
                });
                displayAllInvoices(data);
            } else {
                console.warn("No invoices found");
                displayNoInvoicesMessage();
            }
        },
        error: function (xhr, status, error) {
            console.error("Failed to load invoices:", error);
            alert("Failed to load invoices");
        }
    });
}

function displayNoInvoicesMessage() {
    const container = $(".dashboard");
    container.empty();
    container.html(`
        <div class="card p-4 mb-3">
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle"></i> No invoices found matching your criteria.
            </div>
        </div>
    `);
}

function displayAllInvoices(invoices) {
    const container = $(".dashboard");
    container.empty(); // Clear existing content

    if (!invoices || invoices.length === 0) {
        displayNoInvoicesMessage();
        return;
    }

    invoices.forEach((invoice, index) => {
        const invoiceCard = createInvoiceCard(invoice, index);
        container.append(invoiceCard);
    });
}

function createInvoiceCard(invoice, index) {
    return `
        <div class="card p-4 mb-3" data-invoice-id="${invoice.id ?? invoice.Id}">
            <div style="background:#fff; padding:30px; font-family:Arial, sans-serif; max-width:900px;">

                <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0f1445; padding-bottom:15px;">
                    <div>
                        <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE TO:</div>
                        <div style="font-size:13px; color:#333;">
                            <div><strong class="inv_to">${escapeHtml(invoice.invoiceTo ?? invoice.InvoiceTo ?? '')}</strong></div>
                            <div class="inv_to_address">${escapeHtml(invoice.invoiceToAddress ?? invoice.InvoiceToAddress ?? '')}</div>
                            <div><strong>GSTIN:</strong> <span class="inv_to_gst">${escapeHtml(invoice.gstNoTo ?? invoice.GstNoTo ?? '')}</span></div>
                        </div>
                    </div>

                    <div style="text-align:right;">
                        <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE FROM:</div>
                        <div style="font-size:13px; color:#333;">
                            <div><strong class="inv_from">${escapeHtml(invoice.invoiceFrom ?? invoice.InvoiceFrom ?? '')}</strong></div>
                            <div class="inv_from_address">${escapeHtml(invoice.invoiceFromAddress ?? invoice.InvoiceFromAddress ?? '')}</div>
                            <div><strong>GSTIN:</strong> <span class="inv_from_gst">${escapeHtml(invoice.gstNoFrom ?? invoice.GstNoFrom ?? '')}</span></div>
                        </div>
                    </div>
                </div>

                <div style="text-align:center; margin:20px 0;">
                    <div style="font-size:16px; font-weight:bold; color:#0f1445;">
                        INVOICE NUMBER: <span class="inv_number">${escapeHtml(invoice.invoiceNumber ?? invoice.InvoiceNumber ?? '')}</span>
                    </div>
                    <div style="font-size:12px; color:#666;">
                        Date: <span class="inv_date">${escapeHtml(invoice.createdDate ?? invoice.CreatedDate ?? '')}</span>
                    </div>
                </div>

                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>PARTICULARS</th>
                            <th class="text-end">GROSS AMOUNT</th>
                            <th class="text-end">NET AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>BUSINESS COMPLIANCE SERVICE CHARGES</strong></td>
                            <td class="text-end"></td>
                            <td class="text-end"></td>
                        </tr>
                        <tr>
                            <td>BALLYGUNGE | APPROVAL DATE: 06/03/2025</td>
                            <td class="text-end inv_gross">${escapeHtml(invoice.grossAmoutRs ?? invoice.GrossAmoutRs ?? '0.00')}</td>
                            <td class="text-end inv_net">${escapeHtml(invoice.netAmoutRsm ?? invoice.NetAmoutRsm ?? '0.00')}</td>
                        </tr>
                        <tr>
                            <td class="fw-bold">IGST 18%</td>
                            <td class="text-end inv_tax">${escapeHtml(invoice.igst ?? invoice.IGST ?? '0.00')}</td>
                            <td class="text-end inv_tax2">${escapeHtml(invoice.taxAmount ?? invoice.TaxAmount ?? '0.00')}</td>
                        </tr>
                        <tr class="table-dark">
                            <td class="fw-bold">NET TOTAL</td>
                            <td class="text-end"></td>
                            <td class="text-end fw-bold inv_total">${escapeHtml(invoice.netTotal ?? invoice.NetTotal ?? '0.00')}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary invoiceEditBtn" style="background:#0f1445;border:none;">Edit</button>
                    <button class="btn btn-secondary" onclick="window.print()">Print</button>
                </div>

            </div>
        </div>
    `;
}

function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Edit functionality using event delegation
$(document).on("click", ".invoiceEditBtn", function () {
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const isSave = $(this).text().trim() === "Save";

    const editableFields = [
        "inv_to_address",
        "inv_to_gst",
        "inv_from",
        "inv_from_address",
        "inv_from_gst",
        "inv_gross",
        "inv_tax",
        "inv_net",
        "inv_total",
        "inv_to"
    ];

    if (!isSave) {
        // Switch to edit mode
        editableFields.forEach(className => {
            const el = card.find("." + className);
            const currentValue = el.text().trim();
            el.html(`<input class="form-control form-control-sm" value="${currentValue}">`);
        });

        $(this).text("Save").css("background", "#28a745");
        return;
    }

    const originalInvoice = invoicesData[invoiceId] || {};
    const originalSnapshot = JSON.parse(JSON.stringify(originalInvoice)); // deep copy for rollback

    const updatedFields = { id: invoiceId };

    // field mapping: DOM class -> possible server keys (prefer existing key in original)
    const fldMap = [
        { cls: "inv_to", names: ["invoiceTo", "InvoiceTo"] },
        { cls: "inv_to_address", names: ["invoiceToAddress", "InvoiceToAddress"] },
        { cls: "inv_to_gst", names: ["gstNoTo", "GstNoTo", "invoiceToGST", "InvoiceToGST"] },
        { cls: "inv_from", names: ["invoiceFrom", "InvoiceFrom"] },
        { cls: "inv_from_address", names: ["invoiceFromAddress", "InvoiceFromAddress"] },
        { cls: "inv_from_gst", names: ["gstNoFrom", "GstNoFrom", "invoiceFromGST", "InvoiceFromGST"] },
        { cls: "inv_gross", names: ["grossAmoutRs", "GrossAmoutRs", "grossAmount", "GrossAmount"] },
        { cls: "inv_net", names: ["netAmoutRsm", "NetAmoutRsm", "netAmount", "NetAmount", "subTotal", "SubTotal"] },
        { cls: "inv_tax", names: ["igst", "IGST", "taxAmount", "TaxAmount"] },
        { cls: "inv_total", names: ["netTotal", "NetTotal", "totalAmount", "TotalAmount"] }
    ];

    fldMap.forEach(mapping => {
        const inputEl = card.find(`.${mapping.cls} input`);
        if (!inputEl.length) return;
        const newValRaw = inputEl.val();
        const newVal = newValRaw == null ? "" : String(newValRaw).trim();

        // pick a key that exists on originalInvoice, else the first candidate (camelCase)
        const chosenKey = mapping.names.find(n => originalInvoice.hasOwnProperty(n)) ?? mapping.names[0];

        const origVal = originalInvoice[chosenKey] != null ? String(originalInvoice[chosenKey]).trim() : "";

        // include only when changed (or explicitly cleared)
        if (newVal !== "" && newVal !== origVal) {
            updatedFields[chosenKey] = newVal;
        } else if (newVal === "" && origVal !== "") {
            updatedFields[chosenKey] = "";
        }
    });

    // If nothing changed, just restore UI and exit
    const hasChanges = Object.keys(updatedFields).length > 1;
    if (!hasChanges) {
        editableFields.forEach(className => {
            const val = card.find("." + className + " input").val();
            card.find("." + className).text(val);
        });
        $(this).text("Edit").css("background", "#0f1445");
        return;
    }

    // Build a full merged invoice object (original + only edited fields) to send to server.
    const mergedInvoice = { ...(originalInvoice || {}), ...updatedFields };

    // Keep snapshot for rollback, then optimistically update cache & UI
    invoicesData[invoiceId] = mergedInvoice;

    // Replace inputs with their user values in UI
    editableFields.forEach(className => {
        const input = card.find("." + className + " input");
        if (input.length) {
            const val = input.val();
            card.find("." + className).text(val);
        }
    });

    $(this).text("Edit").css("background", "#0f1445");

    // Send full merged invoice to server (server expects full model for PUT)
    updateInvoice(mergedInvoice, invoiceId, card, function (serverUpdated) {
        if (serverUpdated) {
            invoicesData[invoiceId] = { ...(originalInvoice || {}), ...serverUpdated };
        }
    }, function rollback() {
        // on failure restore snapshot to cache and UI
        invoicesData[invoiceId] = originalSnapshot;
        Object.keys(originalSnapshot).forEach(key => {
            switch (key) {
                case "invoiceTo":
                case "InvoiceTo":
                    card.find(".inv_to").text(originalSnapshot[key]);
                    break;
                case "invoiceToAddress":
                case "InvoiceToAddress":
                    card.find(".inv_to_address").text(originalSnapshot[key]);
                    break;
                case "gstNoTo":
                case "GstNoTo":
                    card.find(".inv_to_gst").text(originalSnapshot[key]);
                    break;
                case "invoiceFrom":
                case "InvoiceFrom":
                    card.find(".inv_from").text(originalSnapshot[key]);
                    break;
                case "invoiceFromAddress":
                case "InvoiceFromAddress":
                    card.find(".inv_from_address").text(originalSnapshot[key]);
                    break;
                case "gstNoFrom":
                case "GstNoFrom":
                    card.find(".inv_from_gst").text(originalSnapshot[key]);
                    break;
                case "grossAmoutRs":
                case "GrossAmoutRs":
                    card.find(".inv_gross").text(originalSnapshot[key]);
                    break;
                case "netAmoutRsm":
                case "NetAmoutRsm":
                    card.find(".inv_net").text(originalSnapshot[key]);
                    break;
                case "igst":
                case "IGST":
                    card.find(".inv_tax").text(originalSnapshot[key]);
                    break;
                case "netTotal":
                case "NetTotal":
                    card.find(".inv_total").text(originalSnapshot[key]);
                    break;
                case "invoiceNumber":
                case "InvoiceNumber":
                    card.find(".inv_number").text(originalSnapshot[key]);
                    break;
                case "createdDate":
                case "CreatedDate":
                    card.find(".inv_date").text(originalSnapshot[key]);
                    break;
                default:
                    break;
            }
        });
    });
});

function updateInvoice(invoiceObject, invoiceId, card, callback, rollbackCallback) {
    $.ajax({
        url: `${API_BASE}/${invoiceId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(invoiceObject),
        success: function (data) {
            alert("Invoice updated successfully");
            if (data && typeof data === "object") {
                invoicesData[invoiceId] = { ...(invoicesData[invoiceId] || {}), ...data };
                if (typeof callback === "function") callback(data);
            } else {
                if (typeof callback === "function") callback(null);
            }
        },
        error: function (xhr, status, error) {
            console.error("Update failed:", error);
            console.error("Response:", xhr.responseText);
            alert("Update failed");
            if (typeof rollbackCallback === "function") rollbackCallback();
        }
    });
}

function createInvoice() {
    const invoice = {
        invoiceTo: "New Client",
        invoiceToAddress: "Address",
        invoiceToGST: "GSTIN",
        invoiceFrom: "Your Company",
        invoiceFromAddress: "Your Address",
        invoiceFromGST: "Your GSTIN",
        invoiceNumber: "INV/001",
        invoiceDate: new Date().toLocaleDateString(),
        grossAmount: "0.00",
        taxAmount: "0.00",
        netAmount: "0.00",
        totalAmount: "0.00"
    };

    $.ajax({
        url: API_BASE,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(invoice),
        success: function (id) {
            alert("Invoice created. ID: " + id);
            loadInvoices();
        },
        error: function (xhr, status, error) {
            console.error("Create failed:", error);
            alert("Create failed");
        }
    });
}

function removeEmptyFilters(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== null && v !== '')
    );
}

// Filter Submit Handler
$('#submitBtnInvoice').on('click', function (e) {
    e.preventDefault();

    let filters = {
        invoiceDate: $('#invoiceDate').val(),
        invoiceNumber: $('#invoiceNumber').val()
    };

    filters = removeEmptyFilters(filters);

    // Check if any filters are applied
    if (Object.keys(filters).length === 0) {
        // No filters - show all invoices
        displayAllInvoices(allInvoices);
    } else {
        // Apply filters
        applyFilters(filters);
    }
});

function applyFilters(filters) {
    const processedFilters = {};

    for (const [key, value] of Object.entries(filters)) {
        if (typeof value === 'string' && value.includes(',')) {
            processedFilters[key] = value.split(',').map(v => v.trim());
        } else {
            processedFilters[key] = value;
        }
    }

    $.ajax({
        url: '/invoice/filter',
        type: 'GET',
        data: processedFilters,
        traditional: true,
        success: function (response) {
            console.log('Filtered data:', response);

            if (response && response.length > 0) {
                // Update stored data with filtered results
                response.forEach(invoice => {
                    invoicesData[invoice.id ?? invoice.Id] = invoice;
                });
                // Display filtered invoices
                displayAllInvoices(response);
            } else {
                // No results found
                displayNoInvoicesMessage();
            }
        },
        error: function (xhr, status, error) {
            console.error('Failed to apply filters:', status, error, xhr.responseText);
            alert('Failed to apply filters');
        }
    });
}

// Clear Button Handler
$('#clearBtn').on('click', function (e) {
    e.preventDefault();

    // Reset the form
    $('#filterForm')[0].reset();
    $('.searchable-input').val('');
    $('input[type="hidden"]').val('');
    $('.searchable-dropdown-list li').removeClass('selected');

    // Show all invoices again
    displayAllInvoices(allInvoices);
});

$(document).ready(function () {
    loadInvoices();
    $("#invoiceFilters").show();
});