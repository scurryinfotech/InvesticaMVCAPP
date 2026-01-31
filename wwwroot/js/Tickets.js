// Tickets.js
// jQuery version with AJAX and searchable status dropdown using Select2

$(document).ready(function () {
    const api = {
        tickets: '/tickets',
        companies: '/companies',
        licenses: '/licensetypes',
        statuses: '/statuses',
        employees: '/employees'
    };

    let statusesData = [];
    let statusesMap = {};

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"'`=\/]/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            }[c];
        });
    }

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function buildTicketCard(t, maps, idx) {
        debugger
        const { companiesMap, licensesMap, statusesMap, employeesMap } = maps;
        const statusLabel = statusesMap[t.statusId] || t.statusId || '';
        const licenseLabel = licensesMap[t.licenseId] || t.licenseId || '';
        const companyLabel = companiesMap[t.companyId] || '#' + t.companyId;
        const employeeLabel = employeesMap[t.employeeId] || '#' + t.employeeId;

        const cid = 'ticket_' + (t.id || idx);

        return `
<div class="card p-4 mb-3" data-ticket-id="${t.id}" id="card_${t.id}">
  <div class="container-fluid">
    <div class="row g-3">
      <div class="col-md-3 d-flex flex-column">
        <div>
          <div id="${cid}_status" class="rounded border p-2 text-center fw-bold mb-3" data-status-id="${t.statusId || ''}">${escapeHtml(statusLabel)}</div>
          <div id="${cid}_license" class="rounded border p-2 text-center fw-bold mb-3">${escapeHtml(licenseLabel)}</div>
          <div id="${cid}_tracking" class="rounded border p-2 text-center fw-bold mb-3">${escapeHtml(t.trackingNumber || '')}</div>
        </div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-outline-dark btn-sm rounded-pill">More</button>
          <button class="btn btn-outline-dark btn-sm rounded-pill edit-btn" data-card="${cid}">Edit</button>
          <button class="btn btn-outline-dark btn-sm rounded-pill attach-btn" data-card="${cid}">Attachments</button>
        </div>
      </div>
      <div class="col-md-5">
        <div id="${cid}_company" class="rounded border p-2 text-center fw-bold mb-3">${escapeHtml(companyLabel)}</div>
        <div id="${cid}_address" class="rounded border p-3 fw-bold mb-3">${escapeHtml(t.companyAddress || t.address || 'Address not provided')}</div>

        <label class="fw-bold mb-2" style="font-size:0.9em;">Add Note</label>
        <textarea id="${cid}_noteInput" class="form-control mb-2" rows="2" placeholder="Enter your note here..."></textarea>
        <button class="btn btn-sm btn-primary w-100 mb-2 note-btn" data-card="${cid}"
                style="background:#0f1445;border:none;">Add Note</button>
        <div id="${cid}_notes" class="rounded border p-2 bg-light" style="max-height:120px; overflow-y:auto;">
          <small style="color:#666;">Notes will appear here</small>
        </div>
      </div>
      <div class="col-md-4 d-flex flex-column">
        <div id="${cid}_employee" class="rounded border p-2 text-center fw-bold mb-3"> Created By:${escapeHtml(employeeLabel)}</div>
          <div class="rounded border p-2 text-center mb-3 fw-bold"  style="font-size:0.85em; color:#666;">
        <small>Created: ${t.createdDate ? new Date(t.createdDate).toLocaleString() : 'N/A'}</small>
         </div>
        <div id="${cid}_validity" class="rounded border p-2 text-center fw-bold mb-3">${t.validTill || ''}</div>
        <div id="${cid}_desc" class="rounded border p-3 fw-bold bg-light" style="flex:1; min-height:245px; white-space:pre-line; overflow-y:auto;">
          ${escapeHtml(t.description || '')}
        </div>
      </div>
    </div>
  </div>
</div>
`;
    }


    function initializeStatusDropdown(cid, currentStatusId) {
        const statusDiv = $('#' + cid + '_status');

        // Build options HTML
        let optionsHtml = '';
        statusesData.forEach(function (status) {
            const selected = status.id == currentStatusId ? 'selected' : '';
            const label = status.statusName || status.unikey || '#' + status.id;
            optionsHtml += `<option value="${status.id}" ${selected}>${escapeHtml(label)}</option>`;
        });

        // Replace div with select
        const selectHtml = `<select class="form-select status-dropdown" id="${cid}_status_select" style="width: 100%;">${optionsHtml}</select>`;
        statusDiv.html(selectHtml);

        // Initialize Select2 for searchable dropdown without clear button
        $('#' + cid + '_status_select').select2({
            placeholder: 'Select Status',
            allowClear: false,
            width: '100%',
            minimumResultsForSearch: 0,
            dropdownParent: statusDiv,
            templateSelection: function (state) {
                return '';  // Hide selected value display
            }
        });
    }

    function revertStatusToDisplay(cid) {
        const selectElement = $('#' + cid + '_status_select');
        if (selectElement.length === 0) return;

        const selectedStatusId = selectElement.val();
        const selectedStatusLabel = selectedStatusId ? (statusesMap[selectedStatusId] || selectedStatusId) : '';

        // Destroy Select2 instance
        if (selectElement.data('select2')) {
            selectElement.select2('destroy');
        }

        // Revert to display div
        const statusDiv = $('#' + cid + '_status');
        statusDiv.html(escapeHtml(selectedStatusLabel));
        statusDiv.attr('data-status-id', selectedStatusId);
    }

    function wireDelegatedHandlers(container) {
        // Edit/Save buttons
        container.on('click', '.edit-btn', function () {
            const editBtn = $(this);
            const cid = editBtn.attr('data-card');
            const isEditing = editBtn.text().trim().toLowerCase() === 'save';

            if (!isEditing) {
                // Enter edit mode
                const currentStatusId = $('#' + cid + '_status').attr('data-status-id');
                initializeStatusDropdown(cid, currentStatusId);

                // Make other fields editable
                const addressField = $('#' + cid + '_address');
                const addressVal = addressField.text().trim();
                addressField.html('<textarea class="form-control" rows="3">' + escapeHtml(addressVal === 'Address not provided' ? '' : addressVal) + '</textarea>');

                const validityField = $('#' + cid + '_validity');
                const validityVal = validityField.text().trim();
                validityField.html('<input class="form-control" value="' + escapeHtml(validityVal) + '" />');

                const descField = $('#' + cid + '_desc');
                const descVal = descField.text().trim();
                descField.html('<textarea class="form-control" rows="3">' + escapeHtml(descVal) + '</textarea>');

                editBtn.text('Save');
            } else {
                // Save mode
                revertStatusToDisplay(cid);

                const addressField = $('#' + cid + '_address');
                const addressVal = addressField.find('textarea').val() || '';
                addressField.html(addressVal ? escapeHtml(addressVal) : 'Address not provided');

                const validityField = $('#' + cid + '_validity');
                const validityVal = validityField.find('input').val() || '';
                validityField.html(validityVal ? escapeHtml(validityVal) : '');

                const descField = $('#' + cid + '_desc');
                const descVal = descField.find('textarea').val() || '';
                descField.html(descVal ? escapeHtml(descVal) : '');

                editBtn.text('Edit');
            }
        });

        // Add Note button
        container.on('click', '.note-btn', function () {
            const noteBtn = $(this);
            const cid = noteBtn.attr('data-card');
            const input = $('#' + cid + '_noteInput');
            const notesContainer = $('#' + cid + '_notes');
            const noteText = input.val().trim();

            if (!noteText) return;

            const now = new Date().toLocaleString();
            const noteHtml = '<div style="border-bottom:1px solid #ddd; padding:6px 0; font-size:0.85em;">' +
                '<strong style="color:#0f1445">' + now + '</strong><br>' +
                escapeHtml(noteText) + '</div>';

            if (notesContainer.html().includes('Notes will appear here')) {
                notesContainer.html('');
            }

            notesContainer.prepend(noteHtml);
            input.val('');
        });

        // Attachments button
        container.on('click', '.attach-btn', function () {
            const modalEl = $('#attachmentsModal');
            if (modalEl.length > 0) {
                const attachmentsList = $('#attachmentsList');
                if (attachmentsList.length > 0) {
                    attachmentsList.html('<li class="list-group-item">(no attachments)</li>');
                }
                modalEl.modal('show');
            }
        });
    }

    function highlightAndScrollToTicket(ticketId) {
        if (!ticketId) return;

        setTimeout(function () {
            const card = $('#card_' + ticketId);
            if (card.length > 0) {
                card.css({
                    'border': '3px solid #0f1445',
                    'box-shadow': '0 0 20px rgba(15, 20, 69, 0.5)',
                    'background-color': '#f8f9fa'
                });

                $('html, body').animate({
                    scrollTop: card.offset().top - 100
                }, 500);
            }
        }, 100);
    }

    function loadAndRender() {
        // Show loading indicator (optional)
        $('#dashboard').html('<div class="text-center p-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');

        // Fetch all data using jQuery AJAX
        $.when(
            $.ajax({ url: api.tickets, method: 'GET', dataType: 'json' }),
            $.ajax({ url: api.companies, method: 'GET', dataType: 'json' }),
            $.ajax({ url: api.licenses, method: 'GET', dataType: 'json' }),
            $.ajax({ url: api.statuses, method: 'GET', dataType: 'json' }),
            $.ajax({ url: api.employees, method: 'GET', dataType: 'json' })
        ).done(function (ticketsRes, companiesRes, licensesRes, statusesRes, employeesRes) {
            const tickets = ticketsRes[0] || [];
            const companies = companiesRes[0] || [];
            const licenses = licensesRes[0] || [];
            const statuses = statusesRes[0] || [];
            const employees = employeesRes[0] || [];

            // Store statuses globally for dropdown
            statusesData = statuses;

            // Build maps
            const companiesMap = {};
            $.each(companies, function (i, c) {
                companiesMap[c.id] = c.companyName || c.unikey || '#' + c.id;
            });

            const licensesMap = {};
            $.each(licenses, function (i, l) {
                licensesMap[l.id] = l.appTypeName || l.unikey || '#' + l.id;
            });

            statusesMap = {};
            $.each(statuses, function (i, s) {
                statusesMap[s.id] = s.statusName || s.unikey || '#' + s.id;
            });

            const employeesMap = {};
            $.each(employees, function (i, e) {
                employeesMap[e.id] = e.name || '#' + e.id;
            });

            const maps = { companiesMap, licensesMap, statusesMap, employeesMap };

            // Sort tickets newest first by CreatedDate
            const sorted = tickets.slice().sort(function (a, b) {
                const da = a.createdDate ? Date.parse(a.createdDate) : 0;
                const db = b.createdDate ? Date.parse(b.createdDate) : 0;
                return db - da;
            });

            // Render into #dashboard
            const container = $('#dashboard');
            container.html('');

            $.each(sorted, function (idx, t) {
                const html = buildTicketCard(t, maps, idx);
                container.append(html);
            });

            // Wire delegated handlers
            wireDelegatedHandlers(container);

            // Check for ticketId in query params and highlight it
            const ticketId = getQueryParam('ticketId');
            if (ticketId) {
                highlightAndScrollToTicket(ticketId);
            }

        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Failed to load tickets:', textStatus, errorThrown);
            $('#dashboard').html('<div class="alert alert-danger m-3">Failed to load tickets. Please try again.</div>');
        });
    }

    // Initialize on document ready
    loadAndRender();
});