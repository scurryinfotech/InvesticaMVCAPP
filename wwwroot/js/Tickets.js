// Tickets.js
// jQuery version with AJAX and searchable status dropdown using Select2
// Enhanced with save functionality and change tracking

$(document).ready(function () {
    const api = {
        tickets: '/tickets',
        companies: '/companies',
        licenses: '/licensetypes',
        statuses: '/statuses',
        employees: '/employees',
        notes: '/notes'
    };

    let statusesData = [];
    let statusesMap = {};
    let originalTicketData = {}; // Store original data for comparison

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
        <button class="btn btn-sm btn-primary w-100 mb-2 note-btn" data-card="${t.trackingNumber}"
                style="background:#0f1445;border:none;">Add Note</button>
        <div id="${cid}_notes" class="rounded border p-2 bg-light" style="max-height:120px; overflow-y:auto;">
          <small style="color:#666;">Loading notes...</small>
        </div>
      </div>
      <div class="col-md-4 d-flex flex-column">
        <div id="${cid}_employee" class="rounded border p-2 text-center fw-bold mb-3">Created By: ${escapeHtml(employeeLabel)}</div>
        <div class="rounded border p-2 text-center mb-3 fw-bold" style="font-size:0.85em; color:#666;">
          <small>Created: ${t.createdDate ? new Date(t.createdDate).toLocaleString() : 'N/A'}</small>
        </div>
        <div id="${cid}_validity" class="rounded border p-2 text-center fw-bold mb-3"> ${t.validTill ? t.validTill.split('T')[0] : ''}</div>
        <div id="${cid}_desc" class="rounded border p-2 bg-light" style="flex:1; max-height:245px; white-space:pre-line; overflow-y:auto;">
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

        let optionsHtml = '';
        statusesData.forEach(function (status) {
            const selected = status.id == currentStatusId ? 'selected' : '';
            const label = status.statusName || status.unikey || '#' + status.id;
            optionsHtml += `<option value="${status.id}" ${selected}>${escapeHtml(label)}</option>`;
        });

        const selectHtml = `<select class="form-select status-dropdown" id="${cid}_status_select" style="width: 100%;">${optionsHtml}</select>`;
        statusDiv.html(selectHtml);

        $('#' + cid + '_status_select').select2({
            placeholder: 'Select Status',
            allowClear: false,
            width: '100%',
            minimumResultsForSearch: 0,
            dropdownParent: statusDiv,
            templateSelection: function (state) {
                return '';
            }
        });
    }

    function revertStatusToDisplay(cid) {
        const selectElement = $('#' + cid + '_status_select');
        if (selectElement.length === 0) return;

        const selectedStatusId = selectElement.val();
        const selectedStatusLabel = selectedStatusId ? (statusesMap[selectedStatusId] || selectedStatusId) : '';

        if (selectElement.data('select2')) {
            selectElement.select2('destroy');
        }

        const statusDiv = $('#' + cid + '_status');
        statusDiv.html(escapeHtml(selectedStatusLabel));
        statusDiv.attr('data-status-id', selectedStatusId);
    }

    function captureOriginalData(cid, ticketId) {
        originalTicketData[ticketId] = {
            statusId: $('#' + cid + '_status').attr('data-status-id'),
            address: $('#' + cid + '_address').text().trim(),
            validTill: $('#' + cid + '_validity').text().trim(),
            description: $('#' + cid + '_desc').text().trim()
        };
    }

    function getChangedFields(ticketId, cid) {
        const original = originalTicketData[ticketId];
        if (!original) return [];

        const changes = [];
        const currentStatusId = $('#' + cid + '_status_select').length > 0
            ? $('#' + cid + '_status_select').val()
            : $('#' + cid + '_status').attr('data-status-id');

        const currentAddress = $('#' + cid + '_address').find('textarea').length > 0
            ? $('#' + cid + '_address').find('textarea').val().trim()
            : $('#' + cid + '_address').text().trim();

        const currentValidity = $('#' + cid + '_validity').find('input').length > 0
            ? $('#' + cid + '_validity').find('input').val().trim()
            : $('#' + cid + '_validity').text().trim();

        const currentDescription = $('#' + cid + '_desc').find('textarea').length > 0
            ? $('#' + cid + '_desc').find('textarea').val().trim()
            : $('#' + cid + '_desc').text().trim();

        // Check for changes
        if (currentStatusId != original.statusId) {
            const oldStatusLabel = statusesMap[original.statusId] || original.statusId;
            const newStatusLabel = statusesMap[currentStatusId] || currentStatusId;
            changes.push(`Status changed from "${oldStatusLabel}" to "${newStatusLabel}"`);
        }

        if (currentAddress !== original.address &&
            !(currentAddress === '' && original.address === 'Address not provided')) {
            changes.push(`Address changed from "${original.address}" to "${currentAddress}"`);
        }

        if (currentValidity !== original.validTill) {
            changes.push(`Validity changed from "${original.validTill}" to "${currentValidity}"`);
        }

        if (currentDescription !== original.description) {
            changes.push(`Description updated`);
        }

        return changes;
    }

    function saveTicketChanges(ticketId, cid, callback) {
        const changes = getChangedFields(ticketId, cid);

        // Check if there are any changes
        if (changes.length === 0) {
            alert('No changes detected. Nothing to save.');
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
            

            if (callback) callback(true);
            return; // Exit early without making AJAX call
        }
            

        const statusId = $('#' + cid + '_status_select').length > 0
            ? $('#' + cid + '_status_select').val()
            : $('#' + cid + '_status').attr('data-status-id');

        const address = $('#' + cid + '_address').find('textarea').length > 0
            ? $('#' + cid + '_address').find('textarea').val().trim()
            : $('#' + cid + '_address').text().trim();

        let validTill = $('#' + cid + '_validity').find('input').length > 0
            ? $('#' + cid + '_validity').find('input').val().trim()
            : $('#' + cid + '_validity').text().trim();

        const description = $('#' + cid + '_desc').find('textarea').length > 0
            ? $('#' + cid + '_desc').find('textarea').val().trim()
            : $('#' + cid + '_desc').text().trim();

        // Convert validTill to ISO format if it exists
        let validTillFormatted = null;
        if (validTill) {
            try {
                const dateObj = new Date(validTill);
                if (!isNaN(dateObj.getTime())) {
                    validTillFormatted = dateObj.toISOString();
                }
            } catch (e) {
                console.warn('Invalid date format for ValidTill:', validTill);
            }
        }

        // Build updated description with change log
        let updatedDescription = description;
        const changeLog = changes.join('; ');
        const timestamp = new Date().toLocaleString();
        const changeEntry = `[${timestamp}] ${changeLog}`;

        // Check if description already has change history section
        if (updatedDescription.includes('--- Change History ---')) {
            // Append to existing change history
            updatedDescription = updatedDescription + '\n' + changeEntry;
        } else {
            // Create new change history section
            updatedDescription = updatedDescription + '\n\n--- Change History ---\n' + changeEntry;
        }

        const updateData = {
            Id: ticketId,
            StatusId: parseInt(statusId),
            CompanyAddress: address || '',
            ValidTill: validTillFormatted,
            Description: updatedDescription
        };

        $.ajax({
            url: api.tickets + '/' + ticketId,
            method: 'PUT',
            data: JSON.stringify(updateData),
            contentType: 'application/json',
            success: function (response) {

                originalTicketData[ticketId] = {
                    statusId: statusId,
                    address: address,
                    validTill: validTill,
                    description: updatedDescription
                };

                $('#' + cid + '_desc').html(escapeHtml(updatedDescription));
                loadAndRender();

                if (callback) callback(true);
            },
            error: function (xhr, status, error) {
                console.error('Error saving ticket:', error);
                console.error('Response:', xhr.responseText);
                alert('Failed to save changes: ' + error);
                if (callback) callback(false);
            }
        });
    }

    function wireDelegatedHandlers(container) {
        // Edit/Save buttons
        container.on('click', '.edit-btn', function () {
            const editBtn = $(this);
            const cid = editBtn.attr('data-card');
            const cardElement = editBtn.closest('.card');
            const ticketId = cardElement.attr('data-ticket-id');
            const isEditing = editBtn.text().trim().toLowerCase() === 'save';

            if (!isEditing) {
                // Enter edit mode - capture original data first
                captureOriginalData(cid, ticketId);

                const currentStatusId = $('#' + cid + '_status').attr('data-status-id');
                initializeStatusDropdown(cid, currentStatusId);

                const addressField = $('#' + cid + '_address');
                const addressVal = addressField.text().trim();
                addressField.html('<textarea class="form-control" rows="3">' + escapeHtml(addressVal === 'Address not provided' ? '' : addressVal) + '</textarea>');

                const validityField = $('#' + cid + '_validity');
                const validityVal = validityField.text().trim();
                validityField.html(
                    '<input class="form-control" type="date" value="' +
                    escapeHtml(validityVal) +
                    '" />'
                );


                const descField = $('#' + cid + '_desc');
                const descVal = descField.text().trim();
                descField.html('<textarea class="form-control" rows="8">' + escapeHtml(descVal) + '</textarea>');

                editBtn.text('Save');
            } else {
                // Save mode
                editBtn.prop('disabled', true);

                saveTicketChanges(ticketId, cid, function (success) {
                    if (success) {
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
                    editBtn.prop('disabled', false);
                });
            }
        });

        // Add Note button
        container.on('click', '.note-btn', function () {
            const noteBtn = $(this);
            const trackingNumber = noteBtn.attr('data-card');
            const cardElement = noteBtn.closest('.card');
            const ticketId = cardElement.attr('data-ticket-id');
            const cid = cardElement.attr('id').replace('card_', 'ticket_');

            const input = $('#' + cid + '_noteInput');
            const notesContainer = $('#' + cid + '_notes');
            const noteText = input.val().trim();

            if (!noteText) return;

            noteBtn.prop('disabled', true);

            $.ajax({
                url: api.notes,
                method: 'POST',
                data: JSON.stringify({
                    ticketId: parseInt(ticketId),
                    noteText: noteText
                }),
                contentType: 'application/json',
                success: function (response) {
                    const timestamp = response.timestamp || new Date().toLocaleString();

                    const noteHtml = '<div style="border-bottom:1px solid #ddd; padding:6px 0; font-size:0.85em;">' +
                        '<strong style="color:#0f1445">' + timestamp + '</strong><br>' +
                        escapeHtml(noteText) + '</div>';

                    if (notesContainer.html().includes('Notes will appear here') ||
                        notesContainer.html().includes('Loading notes')) {
                        notesContainer.html('');
                    }

                    notesContainer.prepend(noteHtml);
                    input.val('');
                    noteBtn.prop('disabled', false);
                },
                error: function (xhr, status, error) {
                    console.error('Error details:', xhr.responseText);
                    alert('Failed to save note: ' + error);
                    noteBtn.prop('disabled', false);
                }
            });
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

    function loadNotesForTicket(ticketId, cid) {
        const notesContainer = $('#' + cid + '_notes');

        $.ajax({
            url: `/note/${ticketId}`,
            method: 'GET',
            dataType: 'json',
            success: function (notes) {
                if (notes && notes.length > 0) {
                    notesContainer.html('');
                    notes.forEach(function (note) {
                        const noteHtml = '<div style="border-bottom:1px solid #ddd; padding:6px 0; font-size:0.85em;">' +
                            '<strong style="color:#0f1445">' + note.timestamp + '</strong><br>' +
                            escapeHtml(note.noteText) + '</div>';
                        notesContainer.append(noteHtml);
                    });
                } else {
                    notesContainer.html('<small style="color:#666;">Notes will appear here</small>');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading notes:', error);
                notesContainer.html('<small style="color:#666;">Notes will appear here</small>');
            }
        });
    }

    function loadAndRender() {
        $('#dashboard').html('<div class="text-center p-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');

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

            statusesData = statuses;

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

            const sorted = tickets.slice().sort(function (a, b) {
                const da = a.createdDate ? Date.parse(a.createdDate) : 0;
                const db = b.createdDate ? Date.parse(b.createdDate) : 0;
                return db - da;
            });

            const container = $('#dashboard');
            container.html('');

            $.each(sorted, function (idx, t) {
                const html = buildTicketCard(t, maps, idx);
                container.append(html);

                const cid = 'ticket_' + t.id;
                loadNotesForTicket(t.id, cid);
            });

            wireDelegatedHandlers(container);

            const ticketId = getQueryParam('ticketId');
            if (ticketId) {
                highlightAndScrollToTicket(ticketId);
            }

        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Failed to load tickets:', textStatus, errorThrown);
            $('#dashboard').html('<div class="alert alert-danger m-3">Failed to load tickets. Please try again.</div>');
        });
    }

    loadAndRender();
});