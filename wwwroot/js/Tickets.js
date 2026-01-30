// Tickets.js
// Dynamically load tickets and master-data, render newest-first, wire note/edit/attachment handlers.

(() => {
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const api = {
        tickets: '/tickets',
        companies: '/companies',
        licenses: '/licensetypes',
        statuses: '/statuses',
        employees: '/employees'
    };

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"'`=\/]/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
        }[c]));
    }

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
    }

    function buildTicketCard(t, maps, idx) {
        const { companiesMap, licensesMap, statusesMap, employeesMap } = maps;
        const statusLabel = statusesMap[t.statusId] || t.statusId || '';
        const licenseLabel = licensesMap[t.licenseId] || t.licenseId || '';
        const companyLabel = companiesMap[t.companyId] || `#${t.companyId}`;
        const employeeLabel = employeesMap[t.employeeId] || `#${t.employeeId}`;

        const cid = `ticket_${t.id || idx}`;

        return `
<div class="card p-4 mb-3" data-ticket-id="${t.id}" id="card_${t.id}">
  <div class="container-fluid">
    <div class="row g-3">
      <div class="col-md-3 d-flex flex-column">
        <div>
          <div id="${cid}_status" class="rounded border p-2 text-center fw-bold mb-3">${escapeHtml(statusLabel)}</div>
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
        <div id="${cid}_employee" class="rounded border p-2 text-center fw-bold mb-3">${escapeHtml(employeeLabel)}</div>
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

    function wireDelegatedHandlers(container) {
        // edit/save buttons
        container.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const cid = editBtn.getAttribute('data-card');
                const isEditing = editBtn.textContent.trim().toLowerCase() === 'save';
                const fields = [
                    `${cid}_status`, /*`${cid}_license`, `${cid}_tracking`,
                    `${cid}_company`,*/ `${cid}_address`, /* `${cid}_employee`,*/
                    `${cid}_validity`, `${cid}_desc`
                ];

                if (!isEditing) {
                    fields.forEach(id => {
                        const el = document.getElementById(id);
                        if (!el) return;
                        const val = el.innerText.trim();
                        if (id.endsWith('_desc') || id.endsWith('_address')) {
                            el.innerHTML = `<textarea class="form-control" rows="3">${escapeHtml(val === 'Address not provided' ? '' : val)}</textarea>`;
                        } else {
                            el.innerHTML = `<input class="form-control" value="${escapeHtml(val)}" />`;
                        }
                    });
                    editBtn.textContent = 'Save';
                } else {
                    fields.forEach(id => {
                        const el = document.getElementById(id);
                        if (!el) return;
                        if (id.endsWith('_desc') || id.endsWith('_address')) {
                            const v = el.querySelector('textarea')?.value || '';
                            el.innerHTML = v ? escapeHtml(v) : '';
                        } else {
                            const v = el.querySelector('input')?.value || '';
                            el.innerHTML = v ? escapeHtml(v) : '';
                        }
                    });
                    editBtn.textContent = 'Edit';
                }
                return;
            }

            const noteBtn = e.target.closest('.note-btn');
            if (noteBtn) {
                const cid = noteBtn.getAttribute('data-card');
                const input = document.getElementById(`${cid}_noteInput`);
                const notesContainer = document.getElementById(`${cid}_notes`);
                const noteText = input?.value.trim();
                if (!noteText) return;
                const now = new Date().toLocaleString();
                const div = document.createElement('div');
                div.style.cssText = "border-bottom:1px solid #ddd; padding:6px 0; font-size:0.85em;";
                div.innerHTML = `<strong style="color:#0f1445">${now}</strong><br>${escapeHtml(noteText)}`;
                if (notesContainer && notesContainer.innerHTML.includes('Notes will appear here')) notesContainer.innerHTML = '';
                notesContainer?.insertBefore(div, notesContainer.firstChild);
                if (input) input.value = '';
                return;
            }

            const attachBtn = e.target.closest('.attach-btn');
            if (attachBtn) {
                const modalEl = document.getElementById('attachmentsModal');
                if (modalEl && window.bootstrap) {
                    const attachmentsList = document.getElementById('attachmentsList');
                    if (attachmentsList) {
                        attachmentsList.innerHTML = `<li class="list-group-item">(no attachments)</li>`;
                    }
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
                return;
            }
        });
    }

    function highlightAndScrollToTicket(ticketId) {
        if (!ticketId) return;

        setTimeout(() => {
            const card = document.getElementById(`card_${ticketId}`);
            if (card) {
                card.style.border = '3px solid #0f1445';
                card.style.boxShadow = '0 0 20px rgba(15, 20, 69, 0.5)';
                card.style.backgroundColor = '#f8f9fa';

                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    async function loadAndRender() {
        try {
            // parallel fetch master-data and tickets
            const [tickets, companies, licenses, statuses, employees] = await Promise.all([
                fetchJson(api.tickets),
                fetchJson(api.companies),
                fetchJson(api.licenses),
                fetchJson(api.statuses),
                fetchJson(api.employees)
            ]);

            // build maps
            const companiesMap = {};
            (companies || []).forEach(c => companiesMap[c.id] = c.companyName || c.unikey || `#${c.id}`);
            const licensesMap = {};
            (licenses || []).forEach(l => licensesMap[l.id] = l.appTypeName || l.unikey || `#${l.id}`);
            const statusesMap = {};
            (statuses || []).forEach(s => statusesMap[s.id] = s.statusName || s.unikey || `#${s.id}`);
            const employeesMap = {};
            (employees || []).forEach(e => employeesMap[e.id] = e.name || `#${e.id}`);

            const maps = { companiesMap, licensesMap, statusesMap, employeesMap };

            // sort tickets newest first by CreatedDate if present; fallback to server order
            const sorted = (tickets || []).slice().sort((a, b) => {
                const da = a.createdDate ? Date.parse(a.createdDate) : 0;
                const db = b.createdDate ? Date.parse(b.createdDate) : 0;
                return db - da;
            });

            // Render into #dashboard (replace static content)
            const container = qs('#dashboard');
            if (!container) return;
            container.innerHTML = '';
            sorted.forEach((t, idx) => {
                const html = buildTicketCard(t, maps, idx);
                container.insertAdjacentHTML('beforeend', html);
            });

            // wire delegated handlers on the new container
            wireDelegatedHandlers(container);

            // Check for ticketId in query params and highlight it
            const ticketId = getQueryParam('ticketId');
            if (ticketId) {
                highlightAndScrollToTicket(ticketId);
            }

        } catch (err) {
            console.error('Failed to load tickets', err);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadAndRender();
    });
})();