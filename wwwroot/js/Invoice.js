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
                <i class="bi bi-info-circle"></i> No invoices found.
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
        if (item.itemType === "heading" || item.ItemType === "heading") {
            const headingText = item.headingText ?? item.HeadingText ?? '';
            html += `
                <tr class="table-dark heading-row" data-item-type="heading" data-row-index="${idx}">
                    <td colspan="3" style="font-weight:bold; font-size:15px; color:#fff;">
                        ${editMode
                    ? `<input class="form-control form-control-sm heading-input" data-row-index="${idx}" value="${escapeHtml(headingText)}" style="background:#333; color:#fff; border:1px solid #555;">`
                    : escapeHtml(headingText)}
                    </td>
                    ${editMode ? `<td class="text-end" style="width:80px;"><button class="btn btn-sm btn-danger remove-row-btn" data-row-index="${idx}" type="button">Remove</button></td>` : ''}
                </tr>`;
        } else {
            const particulars = item.particulars ?? item.Particulars ?? '';
            const gross = (item.grossAmount ?? item.GrossAmount ?? '') || '';
            const net = (item.netAmount ?? item.NetAmount ?? '') || '';
            html += `
                <tr data-row-index="${idx}" data-item-type="data">
                    <td>
                        ${editMode
                    ? `<input class="form-control form-control-sm particulars-input" data-row-index="${idx}" value="${escapeHtml(particulars)}">`
                    : escapeHtml(particulars)}
                    </td>
                    <td class="text-end">
                        ${editMode
                    ? `<input class="form-control form-control-sm gross-input" data-row-index="${idx}" value="${escapeHtml(gross)}">`
                    : escapeHtml(Number(gross || 0).toFixed(2))}
                    </td>
                    <td class="text-end">
                        ${editMode
                    ? `<input class="form-control form-control-sm net-input" data-row-index="${idx}" value="${escapeHtml(net)}">`
                    : escapeHtml(Number(net || 0).toFixed(2))}
                    </td>
                    ${editMode ? `<td class="text-end" style="width:80px;"><button class="btn btn-sm btn-danger remove-row-btn" data-row-index="${idx}" type="button">Remove</button></td>` : ''}
                </tr>`;
        }
    });
    return html;
}

function createInvoiceCard(invoice, index) {
    // Provide defaults for lineItems if missing
    if (!invoice.lineItems || invoice.lineItems.length === 0) {
        invoice.lineItems = [
            { itemType: "heading", headingText: "BUSINESS COMPLIANCE SERVICE CHARGES", lineOrder: 1 },
            {
                itemType: "data",
                particulars: "BALLYGUNGE | APPROVAL DATE: 06/03/2025",
                grossAmount: invoice.subTotal ?? invoice.SubTotal ?? 0.00,
                netAmount: invoice.netTotal ?? invoice.NetTotal ?? 0.00,
                lineOrder: 2
            }
        ];
    }

    const invoiceId = invoice.id ?? invoice.Id ?? invoice.tempId;
    const invoiceNumber = invoice.invoiceNumber ?? invoice.InvoiceNumber ?? '';
    const invoiceDate = invoice.invoiceDate ?? invoice.InvoiceDate ?? '';
    const invTo = invoice.invoiceTo ?? invoice.InvoiceTo ?? '';
    const invToAddress = invoice.invoiceToAddress ?? invoice.InvoiceToAddress ?? '';
    const gstTo = invoice.gstNoTo ?? invoice.GstNoTo ?? '';
    const invFrom = invoice.invoiceFrom ?? invoice.InvoiceFrom ?? '';
    const invFromAddress = invoice.invoiceFromAddress ?? invoice.InvoiceFromAddress ?? '';
    const gstFrom = invoice.gstNoFrom ?? invoice.GstNoFrom ?? '';

    return `
    <div class="card p-4 mb-3" data-invoice-id="${invoiceId}">
        <div style="background:#fff; padding:30px; font-family:Arial, sans-serif; max-width:900px;">
            
            <!-- Header Section: Invoice To / Invoice From (editable when in edit mode) -->
            <div style="display:flex; justify-content:space-between; padding-bottom:15px; margin-bottom:15px;">
                <div>
                    <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE TO:</div>
                    <div style="font-size:13px; color:#333;">
                        <div><strong class="inv_to">${escapeHtml(invTo)}</strong></div>
                        <div class="inv_to_address" style="font-size:12px; color:#333; line-height:1.6;">
                        ${escapeHtml(invToAddress)}
                    </div>
                        <div><strong>GSTIN:</strong> <span class="inv_to_gst">${escapeHtml(gstTo)}</span></div>
                    </div>
                </div>

                <div style="text-align:right;">
                    <div style="font-size:18px; font-weight:bold; color:#0f1445;">INVOICE FROM:</div>
                    <div style="font-size:13px; color:#333;">
                        <div><strong class="inv_from">${escapeHtml(invFrom)}</strong></div>
                        <div class="inv_from_address" style="font-size:12px; color:#333; line-height:1.6;">
                        ${escapeHtml(invFromAddress)}
                    </div>
                        <div><strong>GSTIN:</strong> <span class="inv_from_gst">${escapeHtml(gstFrom)}</span></div>
                    </div>
                </div>
            </div>

            <!-- Horizontal Line -->
            <div style="border-bottom:2px solid #0f1445; margin:15px 0;"></div>

            <!-- Invoice Number & Date -->
            <div style="text-align:center; margin:20px 0;">
                <div style="font-size:16px; font-weight:bold; color:#0f1445;">
                    <span class="inv_number">${escapeHtml(invoiceNumber)}</span>
                </div>
                <div style="font-size:12px; color:#666;">
                    Date: <span class="inv_date">${escapeHtml(invoiceDate)}</span>
                </div>
            </div>

            <!-- Dynamic Table with Line Items -->
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
                            ${escapeHtml(Number(invoice.subTotal ?? invoice.SubTotal ?? 0).toFixed(2))}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="1" style="font-weight:bold; text-align:right; padding-right:20px;">IGST 18%</td>
                        <td class="text-end igst-gross-value" style="width:120px;">${escapeHtml(Number(invoice.igst ?? invoice.Igst ?? 0).toFixed(2))}</td>
                        <td class="text-end igst-net-value" style="width:120px;">${escapeHtml(Number(invoice.taxAmount ?? invoice.TaxAmount ?? 0).toFixed(2))}</td>
                    </tr>
                    <tr style="background:#0f1445; color:#fff; font-weight:bold;">
                        <td colspan="1" style="text-align:right; padding-right:20px;">NET TOTAL: <span class="net-total-words">${escapeHtml(invoice.netTotalWords ?? invoice.NetTotalWords ?? 'AMOUNT ONLY.')}</span></td>
                        <td class="text-end"></td>
                        <td class="text-end inv_total" style="font-size:16px;">
                            ${escapeHtml(Number(invoice.netTotal ?? invoice.NetTotal ?? 0).toFixed(2))}
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

    invoice.lineItems.push({ itemType: 'heading', headingText: headingText.trim(), lineOrder: invoice.lineItems.length + 1 });
    card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
});

// ====== ADD ROW ======
$(document).on('click', '.addRowBtn', function (e) {
    e.preventDefault();
    const card = $(this).closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];

    invoice.lineItems.push({
        itemType: 'data',
        particulars: '',
        grossAmount: '',
        netAmount: '',
        lineOrder: invoice.lineItems.length + 1
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
    const btn = $(this);
    const card = btn.closest(".card");
    const invoiceId = card.data("invoice-id");
    const invoice = invoicesData[invoiceId];
    const isSave = btn.text().trim() === "Save";

    if (!isSave) {
        // Enter Edit Mode: make headers editable and table inputs visible
        editingInvoiceId = invoiceId;

        // Replace header text with inputs
        const to = card.find('.inv_to').text();
        const toAddr = card.find('.inv_to_address').text();
        const toGst = card.find('.inv_to_gst').text();
        const from = card.find('.inv_from').text();
        const fromAddr = card.find('.inv_from_address').text();
        const fromGst = card.find('.inv_from_gst').text();
        const invNumber = card.find('.inv_number').text();
        const invDate = card.find('.inv_date').text();

        card.find('.inv_to').replaceWith(`<input class="form-control form-control-sm edit-inv-to" value="${escapeHtml(to)}">`);
        card.find('.inv_to_address').replaceWith(`<textarea class="form-control form-control-sm edit-inv-to-address">${escapeHtml(toAddr)}</textarea>`);
        card.find('.inv_to_gst').replaceWith(`<input class="form-control form-control-sm edit-inv-to-gst" value="${escapeHtml(toGst)}">`);

        card.find('.inv_from').replaceWith(`<input class="form-control form-control-sm edit-inv-from" value="${escapeHtml(from)}">`);
        card.find('.inv_from_address').replaceWith(`<textarea class="form-control form-control-sm edit-inv-from-address">${escapeHtml(fromAddr)}</textarea>`);
        card.find('.inv_from_gst').replaceWith(`<input class="form-control form-control-sm edit-inv-from-gst" value="${escapeHtml(fromGst)}">`);

        card.find('.inv_number').replaceWith(`<input class="form-control form-control-sm edit-inv-number text-center" value="${escapeHtml(invNumber)}">`);
        card.find('.inv_date').replaceWith(`<input type="date" class="form-control form-control-sm edit-inv-date text-center" value="${formatDateForInput(invDate)}">`);

        card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, true));
        card.find('.addHeadingBtn, .addRowBtn').show();

        btn.text("Save").css("background", "#28a745").css("border", "none");
        return;
    }

    // Save Mode: collect header values + line items
    const updatedLineItems = [];
    card.find('.invoice-line-items-tbody tr').each(function (i) {
        const tr = $(this);
        const type = tr.attr('data-item-type');
        if (type === 'heading') {
            const headingInput = tr.find(".heading-input");
            const text = headingInput.length ? headingInput.val().toString().trim() : '';
            updatedLineItems.push({
                itemType: 'heading',
                headingText: text || 'Heading',
                lineOrder: updatedLineItems.length + 1
            });
        } else {
            const particulars = tr.find(".particulars-input").val() ?? '';
            const gross = parseDecimal(tr.find(".gross-input").val());
            const net = parseDecimal(tr.find(".net-input").val());
            updatedLineItems.push({
                itemType: 'data',
                particulars: (particulars ?? '').toString().trim(),
                grossAmount: gross,
                netAmount: net,
                lineOrder: updatedLineItems.length + 1
            });
        }
    });

    // Collect header fields
    const headerTo = card.find('.edit-inv-to').val() ?? '';
    const headerToAddr = card.find('.edit-inv-to-address').val() ?? '';
    const headerToGst = card.find('.edit-inv-to-gst').val() ?? '';
    const headerFrom = card.find('.edit-inv-from').val() ?? '';
    const headerFromAddr = card.find('.edit-inv-from-address').val() ?? '';
    const headerFromGst = card.find('.edit-inv-from-gst').val() ?? '';
    const headerNumber = card.find('.edit-inv-number').val() ?? '';
    const headerDate = card.find('.edit-inv-date').val() ?? '';

    // Compute totals (fallback to provided)
    const subtotal = updatedLineItems
        .filter(x => x.itemType === 'data')
        .reduce((s, it) => s + (parseFloatSafe(it.grossAmount) || 0), 0);

    const igst = round2(subtotal * 0.18);
    const taxAmount = igst;
    const netTotal = round2(subtotal + taxAmount);

    // update invoice object
    invoice.invoiceTo = headerTo.toString().trim();
    invoice.invoiceToAddress = headerToAddr.toString().trim();
    invoice.gstNoTo = headerToGst.toString().trim();
    invoice.invoiceFrom = headerFrom.toString().trim();
    invoice.invoiceFromAddress = headerFromAddr.toString().trim();
    invoice.gstNoFrom = headerFromGst.toString().trim();
    invoice.invoiceNumber = headerNumber.toString().trim();
    invoice.invoiceDate = headerDate.toString();

    invoice.lineItems = updatedLineItems;
    invoice.subTotal = subtotal;
    invoice.igst = igst;
    invoice.taxAmount = taxAmount;
    invoice.netTotal = netTotal;
    invoice.netTotalWords = invoice.netTotalWords ?? '';

    // Exit edit mode visually
    card.find('.invoice-line-items-tbody').html(renderInvoiceLineItems(invoice.lineItems, false));
    card.find('.addHeadingBtn, .addRowBtn').hide();

    // replace inputs with text nodes again
    card.find('.edit-inv-to').replaceWith(`<strong class="inv_to">${escapeHtml(invoice.invoiceTo)}</strong>`);
    card.find('.edit-inv-to-address').replaceWith(`<div class="inv_to_address" style="font-size:12px; color:#333; line-height:1.6;">${escapeHtml(invoice.invoiceToAddress)}</div>`);
    card.find('.edit-inv-to-gst').replaceWith(`<span class="inv_to_gst">${escapeHtml(invoice.gstNoTo)}</span>`);

    card.find('.edit-inv-from').replaceWith(`<strong class="inv_from">${escapeHtml(invoice.invoiceFrom)}</strong>`);
    card.find('.edit-inv-from-address').replaceWith(`<div class="inv_from_address" style="font-size:12px; color:#333; line-height:1.6;">${escapeHtml(invoice.invoiceFromAddress)}</div>`);
    card.find('.edit-inv-from-gst').replaceWith(`<span class="inv_from_gst">${escapeHtml(invoice.gstNoFrom)}</span>`);

    card.find('.edit-inv-number').replaceWith(`<span class="inv_number">${escapeHtml(invoice.invoiceNumber)}</span>`);
    card.find('.edit-inv-date').replaceWith(`<span class="inv_date">${escapeHtml(invoice.invoiceDate)}</span>`);

    btn.text("Edit").css("background", "#0f1445").css("border", "none");

    editingInvoiceId = null;

    // Send to server
    // if this is a newly created temp invoice, call create flow
    if (String(invoiceId).startsWith('new-') || invoiceId === 0) {
        createInvoice(invoice, invoiceId);
    } else {
        updateInvoice(invoice, invoiceId);
    }
});

function parseDecimal(v) {
    if (v == null) return 0;
    const n = parseFloat(String(v).toString().replace(/,/g, ''));
    return isNaN(n) ? 0 : round2(n);
}
function parseFloatSafe(v) {
    if (v == null) return 0;
    const n = parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function formatDateForInput(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${mm}-${dd}`;
}

// ====== CREATE INVOICE FLOW (POST then PUT full model to persist line items) ======
function createInvoice(invoiceObject, tempId) {
    // build payload for POST (master)
    const payload = {
        invoiceNumber: invoiceObject.invoiceNumber ?? invoiceObject.InvoiceNumber ?? '',
        invoiceDate: invoiceObject.invoiceDate ?? invoiceObject.InvoiceDate ?? new Date().toISOString(),
        invoiceTo: invoiceObject.invoiceTo ?? invoiceObject.InvoiceTo ?? '',
        gstNoTo: invoiceObject.gstNoTo ?? invoiceObject.GstNoTo ?? '',
        invoiceToAddress: invoiceObject.invoiceToAddress ?? invoiceObject.InvoiceToAddress ?? '',
        invoiceFrom: invoiceObject.invoiceFrom ?? invoiceObject.InvoiceFrom ?? '',
        gstNoFrom: invoiceObject.gstNoFrom ?? invoiceObject.GstNoFrom ?? '',
        invoiceFromAddress: invoiceObject.invoiceFromAddress ?? invoiceObject.InvoiceFromAddress ?? '',
        subTotal: Number(invoiceObject.subTotal ?? invoiceObject.SubTotal ?? 0),
        igst: Number(invoiceObject.igst ?? invoiceObject.Igst ?? 0),
        taxAmount: Number(invoiceObject.taxAmount ?? invoiceObject.TaxAmount ?? 0),
        netTotal: Number(invoiceObject.netTotal ?? invoiceObject.NetTotal ?? 0),
        netTotalWords: invoiceObject.netTotalWords ?? invoiceObject.NetTotalWords ?? ''
    };

    $.ajax({
        url: API_BASE,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (newId) {
            if (!newId) {
                alert("Failed to create invoice (no id returned)");
                return;
            }

            // update DOM card id and internal maps
            const card = $(`[data-invoice-id="${tempId}"]`);
            if (card.length) {
                card.attr('data-invoice-id', newId);
            }

            // move data from temp key to new key
            invoicesData[newId] = invoicesData[tempId] || invoiceObject;
            delete invoicesData[tempId];

            // Now PUT the full invoice including line items to insert lineitems
            // Ensure id present on object
            invoiceObject.id = newId;
            invoiceObject.Id = newId;

            // call update to persist lineitems
            updateInvoice(invoiceObject, newId);
        },
        error: function (xhr, status, error) {
            console.error("Create invoice failed:", xhr.responseText || error);
            alert("Create invoice failed: " + (xhr.responseText || error));
        }
    });
}

// ====== UPDATE INVOICE (PUT) ======
function updateInvoice(invoiceObject, invoiceId) {
    // Ensure payload shape matches expected server model
    const payload = {
        id: invoiceObject.id ?? invoiceObject.Id ?? invoiceId,
        invoiceNumber: invoiceObject.invoiceNumber ?? invoiceObject.InvoiceNumber ?? '',
        invoiceDate: invoiceObject.invoiceDate ?? invoiceObject.InvoiceDate ?? new Date().toISOString(),
        invoiceTo: invoiceObject.invoiceTo ?? invoiceObject.InvoiceTo ?? '',
        gstNoTo: invoiceObject.gstNoTo ?? invoiceObject.GstNoTo ?? '',
        invoiceToAddress: invoiceObject.invoiceToAddress ?? invoiceObject.InvoiceToAddress ?? '',
        invoiceFrom: invoiceObject.invoiceFrom ?? invoiceObject.InvoiceFrom ?? '',
        gstNoFrom: invoiceObject.gstNoFrom ?? invoiceObject.GstNoFrom ?? '',
        invoiceFromAddress: invoiceObject.invoiceFromAddress ?? invoiceObject.InvoiceFromAddress ?? '',
        subTotal: Number(invoiceObject.subTotal ?? invoiceObject.SubTotal ?? 0),
        igst: Number(invoiceObject.igst ?? invoiceObject.Igst ?? 0),
        taxAmount: Number(invoiceObject.taxAmount ?? invoiceObject.TaxAmount ?? 0),
        netTotal: Number(invoiceObject.netTotal ?? invoiceObject.NetTotal ?? 0),
        netTotalWords: invoiceObject.netTotalWords ?? invoiceObject.NetTotalWords ?? '',
        lineItems: (invoiceObject.lineItems || []).map((li, idx) => ({
            id: li.id ?? li.Id ?? 0,
            invoiceId: invoiceId,
            lineOrder: li.lineOrder ?? li.LineOrder ?? (idx + 1),
            itemType: li.itemType ?? li.ItemType ?? 'data',
            headingText: li.headingText ?? li.HeadingText ?? null,
            particulars: li.particulars ?? li.Particulars ?? null,
            grossAmount: li.grossAmount ?? li.GrossAmount ?? null,
            netAmount: li.netAmount ?? li.NetAmount ?? null
        }))
    };

    $.ajax({
        url: `${API_BASE}/${invoiceId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (data) {
            alert("Invoice updated successfully");
            if (data && typeof data === "object") {
                // update map for this invoice id
                invoicesData[invoiceId] = { ...(invoicesData[invoiceId] || {}), ...data };
                // also update allInvoices list
                const idx = allInvoices.findIndex(x => (x.id ?? x.Id) == invoiceId);
                if (idx >= 0) allInvoices[idx] = invoicesData[invoiceId];
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

// ====== ADD NEW INVOICE BUTTON HANDLER ======
function addNewInvoice() {
    const tempId = 'new-' + Date.now();
    const newInvoice = {
        tempId,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceTo: '',
        gstNoTo: '',
        invoiceToAddress: '',
        invoiceFrom: '',
        gstNoFrom: '',
        invoiceFromAddress: '',
        subTotal: 0,
        igst: 0,
        taxAmount: 0,
        netTotal: 0,
        netTotalWords: '',
        lineItems: [
            { itemType: 'data', particulars: '', grossAmount: 0, netAmount: 0, lineOrder: 1 }
        ]
    };

    // Add to data structures and render
    invoicesData[tempId] = newInvoice;
    allInvoices.unshift(newInvoice);
    // prepend new card
    $(".dashboard").prepend(createInvoiceCard(newInvoice));
    // immediately open edit mode
    const card = $(`[data-invoice-id="${tempId}"]`);
    card.find('.invoiceEditBtn').trigger('click');
}

// ====== INITIALIZE ======
$(document).ready(function () {
    loadInvoices();
    $("#invoiceFilters").show();

    // wire Add New Invoice button
    $(document).on('click', '#addNewInvoiceBtn', function (e) {
        e.preventDefault();
        addNewInvoice();
    });
});                     