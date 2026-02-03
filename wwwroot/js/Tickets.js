// Tickets.js
// jQuery version with AJAX and searchable status dropdown using Select2
// Enhanced with save functionality and change tracking

const ATT_API = {
    getByTicket: '/ticketattachments',
    save: '/ticketattachments',
    download: '/ticketattachments/download',
    delete: '/ticketattachments'
};

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
            const cid = $(this).data('card');                  // "card_42"
            const ticketId = cid.replace('ticket_', '');              // "42"

            // store on modal for other handlers to read
            $('#attachmentsModal').data('ticketId', ticketId);

            // reset upload UI
            $('#attachmentFileInput').val('');
            $('#uploadProgress').hide();
            $('#uploadProgressBar').css('width', '0%').text('0%');

            // fetch from DB and render
            loadAttachments(ticketId);

            $('#attachmentsModal').modal('show');
        });
    }
    $(document).on('click', '#uploadAttachmentBtn', function () {
        const fileInput = $('#attachmentFileInput')[0];
        const files = fileInput.files;

        if (!files || files.length === 0) {
            alert('Please select at least one file (PDF or Image).');
            return;
        }

        const ticketId = $('#attachmentsModal').data('ticketId');
        const totalFiles = files.length;
        let uploaded = 0;

        $('#uploadProgress').show();
        $('#uploadProgressBar').css('width', '0%').text('0 / ' + totalFiles + ' uploaded');

        // loop through every selected file
        Array.from(files).forEach(function (file) {

            // ── FileReader converts the file to Base64 in the browser ──
            const reader = new FileReader();

            reader.onload = function (e) {
                // e.target.result  =  "data:image/png;base64,iVBOR..."
                // strip the prefix so only the pure Base64 string is sent
                const base64Data = e.target.result.split(',')[1];

                // ── build the payload that matches your C# DTO ──
                const payload = {
                    TicketId: ticketId,
                    FileName: file.name,                          // "invoice.pdf"
                    ContentType: file.type || 'application/octet-stream', // "application/pdf"
                    FileTypeId: file.type.includes('pdf') ? 1 : 2,  // 1=PDF, 2=IMAGE
                    Base64Data: base64Data,                         // the actual Base64 string
                    FileSizeBytes: file.size                           // original size in bytes
                };

                // ── AJAX POST to your controller ──
                $.ajax({
                    url: ATT_API.save,
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(payload),
                    success: function (response) {
                        // response = the saved attachment object (with new Id)
                        uploaded++;
                        const pct = Math.round((uploaded / totalFiles) * 100);
                        $('#uploadProgressBar').css('width', pct + '%')
                            .text(uploaded + ' / ' + totalFiles + ' uploaded');

                        // if ALL files done → refresh the list
                        if (uploaded === totalFiles) {
                            $('#attachmentFileInput').val('');
                            $('#uploadProgress').hide();
                            $('#uploadProgressBar').css('width', '0%').text('0%');
                            loadAttachments(ticketId);   // re-fetch from DB
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Upload failed for ' + file.name, error);
                        alert('Upload failed for: ' + file.name);
                        uploaded++;
                        if (uploaded === totalFiles) {
                            $('#attachmentFileInput').val('');
                            $('#uploadProgress').hide();
                            loadAttachments(ticketId);
                        }
                    }
                });
            };

            // ── start reading the file ──
            reader.readAsDataURL(file);
        });
    });
    $(document).on('click', '.download-attachment-btn', function () {
        const attId = $(this).data('att-id');

        $.ajax({
            url: ATT_API.download,
            type: 'GET',
            data: { id: attId },                   // ?id=101
            success: function (response) {
                // response = { fileName, contentType, base64Data }

                // decode Base64  →  binary string  →  Uint8Array  →  Blob
                const binary = atob(response.base64Data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([array], { type: response.contentType });
                const url = URL.createObjectURL(blob);

                // trigger browser download
                const a = document.createElement('a');
                a.href = url;
                a.download = response.fileName;    // "invoice.pdf"
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);              // free memory
            },
            error: function (xhr, status, error) {
                console.error('Download failed:', error);
                alert('Download failed. Please try again.');
            }
        });
    });


    // ============================================================
    // 5.  DELETE  →  soft delete in DB, remove row from list
    // ============================================================
    $(document).on('click', '.delete-attachment-btn', function () {
        const attId = $(this).data('att-id');
        const $li = $(this).closest('li');
        const name = $li.find('.att-file-name').text().trim();
        const ticketId = $('#attachmentsModal').data('ticketId');

        if (!confirm('Delete "' + name + '"?\nThis cannot be undone.')) return;

        $.ajax({
            url: ATT_API.delete,
            type: 'DELETE',
            data: { id: attId },                   // ?id=101
            success: function () {
                $li.fadeOut(300, function () {
                    $(this).remove();
                    // if list is now empty show placeholder
                    if ($('#attachmentsList li').length === 0) {
                        $('#attachmentsList').html(
                            '<li class="list-group-item text-muted text-center py-3">' +
                            '<i class="bi bi-paperclip me-1"></i>No attachments</li>'
                        );
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error('Delete failed:', error);
                alert('Delete failed. Please try again.');
            }
        });
    });
    // Clear button → resets file input only, does NOT touch the list
    $(document).on('click', '#clearAttachmentBtn', function () {
        $('#attachmentFileInput').val('');
        $('#uploadProgress').hide();
        $('#uploadProgressBar').css('width', '0%').text('0%');
    });
    function loadAttachments(ticketId) {
        $.ajax({
            url: ATT_API.getByTicket,
            type: 'GET',
            data: { ticketId: ticketId },          // ?ticketId=42
            success: function (attachments) {
                renderList(attachments);
            },
            error: function (xhr, status, error) {
                console.error('Load attachments failed:', error);
                renderList([]);                        // show empty state
            }
        });
    }

    function renderList(attachments) {
        const $list = $('#attachmentsList');

        if (!attachments || attachments.length === 0) {
            $list.html(
                '<li class="list-group-item text-muted text-center py-3">' +
                '<i class="bi bi-paperclip me-1"></i>No attachments</li>'
            );
            return;
        }

        let html = '';
        attachments.forEach(function (att) {
            debugger
            const isPdf = (att.ContentType || '').toLowerCase().includes('pdf');
            const iconClass = isPdf ? 'bi-filetype-pdf' : 'bi-image';
            const badgeColor = isPdf ? '#fdecea' : '#e2f0fd';
            const iconColor = isPdf ? '#d63384' : '#0d6efd';
            const sizeLabel = formatFileSize(att.FileSizeBytes);

            html += `
        <li class="list-group-item d-flex justify-content-between align-items-center py-2"
            data-att-id="${att.id}">

          <!-- left: icon + info -->
          <div class="d-flex align-items-center gap-2" style="min-width:0;">
            <div style="width:36px;height:36px;border-radius:8px;
                        background:${badgeColor};display:flex;
                        align-items:center;justify-content:center;flex-shrink:0;">
              <i class="bi ${iconClass}" style="color:${iconColor};font-size:1.1rem;"></i>
            </div>
            <div style="min-width:0;">
              <span class="att-file-name fw-semibold text-truncate d-block"
                    style="max-width:260px;" title="${att.FileName}">${att.FileName}</span>
              <small class="text-muted">${sizeLabel}</small>
            </div>
          </div>

          <!-- right: Download + Delete buttons -->
          <div class="d-flex gap-1 flex-shrink-0">
            <button class="btn btn-outline-secondary btn-sm rounded-pill download-attachment-btn"
                    data-att-id="${att.id}" title="Download">
              <i class="bi bi-download"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm rounded-pill delete-attachment-btn"
                    data-att-id="${att.id}" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </li>`;
        });

        $list.html(html);
    }


    // ============================================================
    // 7.  UTILITY  —  bytes → "245.3 KB"
    // ============================================================
    function formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
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