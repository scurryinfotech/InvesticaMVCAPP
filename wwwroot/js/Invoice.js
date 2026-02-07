const API_BASE = "/invoice";
let invoicesData = {};
let allInvoices = [];
let editingInvoiceId = null;

function loadInvoices() {
    $.ajax({
        url: API_BASE,
        method: "GET",
        success: function (data) {
            if (data && data.length > 0) {
                allInvoices = data;
                data.forEach(invoice => {
                    invoicesData[invoice.id ?? invoice.Id] = invoice;
                });
                displayAllInvoices(data);
            } else {
                displayNoInvoicesMessage();
            }
        },
        error: function () {
            alert("Failed to load invoices");
        }
    });
}

function displayNoInvoicesMessage() {
    $(".dashboard").empty().html(`
        <div class="card p-4 mb-3">
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle"></i> No invoices found matching your criteria.
            </div>
        </div>
    `);
}

function displayAllInvoices(invoices) {
    const container = $(".dashboard");
    container.empty();
    if (!invoices || invoices.length === 0) {
        displayNoInvoicesMessage();
        return;
    }
    invoices.forEach((invoice, index) => {
        container.append(createInvoiceCard(invoice, index));
    });
}

// ====== DYNAMIC TABLE RENDERING ======
function renderInvoiceLineItems(lineItems, editMode = false) {
    let html = '';
    lineItems.forEach((item, idx) => {
        if (item.type === "heading") {
            html += `
                <tr class="table-dark heading-row" data-item-type="heading">
                    <td colspan="3" style="font-weight:bold; font-size:15px; color:#fff;">
                        ${editMode
                    ? `<input class="form-control form-control-sm heading-input" data-row-index="${idx}" value="${escapeHtml(item.text)}" style="background:#333; color:#fff; border:1px solid #555;">`
                    : escapeHtml(item.text)}
                    </td>
                    ${editMode ? `<td class="text-end" style="width:80px;"><button class="btn btn-sm btn-danger remove-row-btn" data-row-index="${idx}" type="button">Remove</button></td>` : ''}
                </tr>`;
        } else if (item.type === "data") {
            html += `
                <tr data-row-index="${idx}" data-item-type="data">
                    <td>
                        ${editMode
                    ? `<input class="form-control form-control-sm particulars-input" data-row-index="${idx}" value="${escapeHtml(item.particulars)}">`
                    : escapeHtml(item.particulars)}
                    </td>
                    <td class="text-end">
                        ${editMode
                    ? `<input class="form-control form-control-sm gross-input" data-row-index="${idx}" value="${escapeHtml(item.grossAmount)}">`
                    : escapeHtml(item.grossAmount)}
                    </td>
                    <td class="text-end">
                        ${editMode
                    ? `<input class="form-control form-control-sm net-input" data-row-index="${idx}" value="${escapeHtml(item.netAmount)}">`
                    : escapeHtml(item.netAmount)}
                    </td>
                    ${editMode ? `<td class="text-end" style="width:80px;"><button class="btn btn-sm btn-danger remove-row-btn" data-row-index="${idx}" type="button">Remove</button></td>` : ''}
                </tr>`;
        }
    });
    return html;
}

function createInvoiceCard(invoice, index) {
    // Ensure invoice.lineItems exists
    if (!invoice.lineItems || invoice.lineItems.length === 0) {
        invoice.lineItems = [
            { type: "heading", text: "BUSINESS COMPLIANCE SERVICE CHARGES" },
            {
                type: "data",
                particulars: "BALLYGUNGE | APPROVAL DATE: 06/03/2025",
                grossAmount: invoice.grossAmoutRs ?? invoice.GrossAmoutRs ?? '0.00',
                netAmount: invoice.netAmoutRsm ?? invoice.NetAmoutRsm ?? '0.00'
            }
        ];
    }

    const invoiceId = invoice.id ?? invoice.Id;

    return `
    <div class="card p-4 mb-3" data-invoice-id="${invoiceId}">
        <div style="background:#fff; padding:30px; font-family:Arial, sans-serif; max-width:900px;">
            
            <!-- Header Section: Invoice To / Invoice From (Names & GSTIN Only) -->
            <div style="display:flex; justify-content:space-between; padding-bottom:15px; margin-bottom:15px;">
                <div>
                    <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE TO:</div>
                    <div style="font-size:13px; color:#333;">
                        <div><strong class="inv_to">${escapeHtml(invoice.invoiceTo ?? invoice.InvoiceTo ?? '')}</strong></div>
                        <div class="inv_to_address" style="font-size:12px; color:#333; line-height:1.6;">
                        ${escapeHtml(invoice.invoiceToAddress ?? invoice.InvoiceToAddress ?? 'N/A')}
                    </div>
                        <div><strong>GSTIN:</strong> <span class="inv_to_gst">${escapeHtml(invoice.gstNoTo ?? invoice.GstNoTo ?? '')}</span></div>
                    </div>
                </div>

                <div style="text-align:right;">
                    <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE FROM:</div>
                    <div style="font-size:13px; color:#333;">
                        <div><strong class="inv_from">${escapeHtml(invoice.invoiceFrom ?? invoice.InvoiceFrom ?? '')}</strong></div>
                        <div class="inv_from_address" style="font-size:12px; color:#333; line-height:1.6;">
                        ${escapeHtml(invoice.invoiceFromAddress ?? invoice.InvoiceFromAddress ?? 'N/A')}
                    </div>
                        <div><strong>GSTIN:</strong> <span class="inv_from_gst">${escapeHtml(invoice.gstNoFrom ?? invoice.GstNoFrom ?? '')}</span></div>
                    </div>
                </div>
            </div>

            <!-- Horizontal Line -->
            <div style="border-bottom:2px solid #0f1445; margin:15px 0;"></div>

          

            <!-- Invoice Number & Date -->
            <div style="text-align:center; margin:20px 0;">
                <div style="font-size:16px; font-weight:bold; color:#0f1445;">
                    INVOICE NUMBER: <span class="inv_number">${escapeHtml(invoice.invoiceNumber ?? invoice.InvoiceNumber ?? '')}</span>
                </div>
                <div style="font-size:12px; color:#666;">
                    Date: <span class="inv_date">${escapeHtml(invoice.createdDate ?? invoice.CreatedDate ?? '')}</span>
                </div>
            </div>

            <!-- Dynamic Table with Line Items (NO IGST 18% ROW HERE) -->
            <table class="table table-bordered invoice-line-items-table">
                <thead class="table-dark">
                  <tr>
                    <th>PARTICULARS</th>
                    <th class="text-end" style="width:120px;">GROSS AMOUNT</th>
                    <th class="text-end" style="width:120px;">NET AMOUNT</th>
                  </tr>
                </thead>
                <tbody class="invoice-line-items-tbody">
                  ${renderInvoiceLineItems(invoice.lineItems, false)}
                </tbody>
            </table>

            <!-- Summary Section at Bottom (SUB TOTAL, IGST, NET TOTAL) -->
            <table class="table table-bordered invoice-summary-table" style="margin-top:20px;">
                <tbody class="invoice-summary-tbody">
                    <tr>
                        <td colspan="1" style="font-weight:bold; text-align:right; padding-right:20px;">SUB TOTAL</td>
                        <td class="text-end" style="width:120px;"></td>
                        <td class="text-end subtotal-value" style="width:120px; font-weight:bold;">
                            ${escapeHtml(invoice.subTotal ?? invoice.SubTotal ?? '0.00')}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="1" style="font-weight:bold; text-align:right; padding-right:20px;">IGST 18%</td>
                        <td class="text-end igst-gross-value" style="width:120px;">${escapeHtml(invoice.igst ?? invoice.IGST ?? '0.00')}</td>
                        <td class="text-end igst-net-value" style="width:120px;">${escapeHtml(invoice.taxAmount ?? invoice.TaxAmount ?? '0.00')}</td>
                    </tr>
                    <tr style="background:#0f1445; color:#fff; font-weight:bold;">
                        <td colspan="1" style="text-align:right; padding-right:20px;">NET TOTAL: <span class="net-total-words">${escapeHtml(invoice.netTotalWords ?? invoice.NetTotalWords ?? 'AMOUNT ONLY.')}</span></td>
                        <td class="text-end"></td>
                        <td class="text-end inv_total" style="font-size:16px;">
                            ${escapeHtml(invoice.netTotal ?? invoice.NetTotal ?? '0.00')}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 mt-3 flex-wrap">
                <button class="btn btn-primary invoiceEditBtn" style="background:#0f1445; border:none;">Edit</button>
                <button class="btn btn-secondary" onclick="window.print()">Print</button>
                <button class="btn btn-outline-dark addHeadingBtn" style="display:none;">+ Add Heading</button>
                <button class="btn btn-outline-primary addRowBtn" style="display:none;">+ Add Row</button>
            </div>

        </div>
    </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ====== ADD HEADING ======
$(document).on('click', '.addHeadingBtn', function (e) {
    e.preventDefault();
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];

    const headingText = prompt('Enter heading text:', 'New Heading');
    if (headingText === null || headingText.trim() === '') return;

    invoice.lineItems.push({ type: 'heading', text: headingText.trim() });
    card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
});

// ====== ADD ROW ======
$(document).on('click', '.addRowBtn', function (e) {
    e.preventDefault();
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];

    invoice.lineItems.push({
        type: 'data',
        particulars: '',
        grossAmount: '',
        netAmount: ''
    });
    card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
});

// ====== REMOVE ROW/HEADING ======
$(document).on('click', '.remove-row-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const rowIndex = parseInt($(this).data("row-index"));
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];

    if (confirm('Are you sure you want to remove this row?')) {
        invoice.lineItems.splice(rowIndex, 1);
        card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
    }
});

// ====== EDIT/SAVE FUNCTIONALITY ======
$(document).on("click", ".invoiceEditBtn", function (e) {
    e.preventDefault();
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];
    const isSave = $(this).text().trim() === "Save";

    if (!isSave) {
        // Enter Edit Mode
        editingInvoiceId = invoiceId;
        card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
        card.find('.addHeadingBtn, .addRowBtn').show();
        $(this).text("Save").css("background", "#28a745").css("border", "none");
        return;
    }

    // Save Mode: Collect all updated values
    const updatedLineItems = [];
    let rowIndex = 0;

    card.find('.invoice-line-items-tbody tr').each(function () {
        const tr = $(this);

        if (tr.attr('data-item-type') === 'heading') {
            const headingInput = tr.find(".heading-input");
            if (headingInput.length) {
                const headingText = headingInput.val().trim();
                updatedLineItems.push({
                    type: "heading",
                    text: headingText || "Heading"
                });
            }
        } else if (tr.attr('data-item-type') === 'data') {
            const particulars = tr.find(".particulars-input").val() ?? "";
            const grossAmount = tr.find(".gross-input").val() ?? "";
            const netAmount = tr.find(".net-input").val() ?? "";

            updatedLineItems.push({
                type: "data",
                particulars: particulars.trim(),
                grossAmount: grossAmount.trim(),
                netAmount: netAmount.trim()
            });
        }
        rowIndex++;
    });

    // Update invoice lineItems
    invoice.lineItems = updatedLineItems;

    // Exit Edit Mode
    card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, false));
    card.find('.addHeadingBtn, .addRowBtn').hide();
    $(this).text("Edit").css("background", "#0f1445").css("border", "none");

    editingInvoiceId = null;

    // Send to server
    updateInvoice(invoice, invoiceId);
});

// ====== UPDATE INVOICE (PUT) ======
function updateInvoice(invoiceObject, invoiceId) {
    $.ajax({
        url: `${API_BASE}/${invoiceId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(invoiceObject),
        success: function (data) {
            alert("Invoice updated successfully");
            if (data && typeof data === "object") {
                invoicesData[invoiceId] = { ...(invoicesData[invoiceId] || {}), ...data };
            }
        },
        error: function (xhr, status, error) {
            console.error("Update failed:", error);
            console.error("Response:", xhr.responseText);
            alert("Update failed: " + (xhr.responseText || error));
        }
    });
}

// ====== FILTER FUNCTIONS ======
function removeEmptyFilters(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== null && v !== '')
    );
}

$('#submitBtnInvoice').on('click', function (e) {
    e.preventDefault();

    let filters = {
        invoiceDate: $('#invoiceDate').val(),
        invoiceNumber: $('#invoiceNumber').val()
    };

    filters = removeEmptyFilters(filters);

    if (Object.keys(filters).length === 0) {
        displayAllInvoices(allInvoices);
        return;
    }
    applyFilters(filters);
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
            if (response && response.length > 0) {
                response.forEach(invoice => {
                    invoicesData[invoice.id ?? invoice.Id] = invoice;
                });
                displayAllInvoices(response);
            } else {
                displayNoInvoicesMessage();
            }
        },
        error: function () {
            alert('Failed to apply filters');
        }
    });
}

$('#clearBtn').on('click', function (e) {
    e.preventDefault();
    $('#filterForm')[0].reset();
    $('.searchable-input').val('');
    $('input[type="hidden"]').val('');
    $('.searchable-dropdown-list li').removeClass('selected');
    displayAllInvoices(allInvoices);
});

// ====== INITIALIZE ======
$(document).ready(function () {
    loadInvoices();
    $("#invoiceFilters").show();
});