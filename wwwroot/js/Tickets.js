(() => {
    const qs = s => document.querySelector(s);

    function getTicketIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('ticketId');
        return id ? Number(id) : null;
    }

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
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
            "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
        }[c]));
    }

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
    }

    function buildTicketCard(t, maps, idx) {
        const { companiesMap, licensesMap, statusesMap, employeesMap } = maps;

        const cid = `ticket_${t.id || idx}`;

        return `
<div class="card p-4 mb-3" data-ticket-id="${t.id}">
  <div class="container-fluid">
    <div class="row g-3">
      <div class="col-md-3 d-flex flex-column">
        <div>
          <div id="${cid}_status" class="rounded border p-2 text-center fw-bold mb-3">
            ${escapeHtml(statusesMap[t.statusId] || t.statusId || '')}
          </div>
          <div id="${cid}_license" class="rounded border p-2 text-center fw-bold mb-3">
            ${escapeHtml(licensesMap[t.licenseId] || t.licenseId || '')}
          </div>
          <div id="${cid}_tracking" class="rounded border p-2 text-center fw-bold mb-3">
            ${escapeHtml(t.trackingNumber || '')}
          </div>
        </div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-outline-dark btn-sm rounded-pill">More</button>
          <button class="btn btn-outline-dark btn-sm rounded-pill edit-btn" data-card="${cid}">Edit</button>
          <button class="btn btn-outline-dark btn-sm rounded-pill attach-btn" data-card="${cid}">Attachments</button>
        </div>
      </div>

      <div class="col-md-5">
        <div id="${cid}_company" class="rounded border p-2 text-center fw-bold mb-3">
          ${escapeHtml(companiesMap[t.companyId] || `#${t.companyId}`)}
        </div>
        <div id="${cid}_address" class="rounded border p-3 fw-bold mb-3">
          ${escapeHtml(t.companyAddress || 'Address not provided')}
        </div>

        <label class="fw-bold mb-2" style="font-size:0.9em;">Add Note</label>
        <textarea id="${cid}_noteInput" class="form-control mb-2" rows="2"></textarea>
        <button class="btn btn-sm btn-primary w-100 mb-2 note-btn" data-card="${cid}">
          Add Note
        </button>
        <div id="${cid}_notes" class="rounded border p-2 bg-light">
          <small>Notes will appear here</small>
        </div>
      </div>

      <div class="col-md-4 d-flex flex-column">
        <div id="${cid}_employee" class="rounded border p-2 text-center fw-bold mb-3">
          ${escapeHtml(employeesMap[t.employeeId] || `#${t.employeeId}`)}
        </div>
        <div id="${cid}_validity" class="rounded border p-2 text-center fw-bold mb-3">
          ${t.validTill || ''}
        </div>
        <div id="${cid}_desc" class="rounded border p-3 fw-bold bg-light" style="flex:1;">
          ${escapeHtml(t.description || '')}
        </div>
      </div>
    </div>
  </div>
</div>`;
    }

    function wireDelegatedHandlers(container) {
        container.addEventListener('click', e => {
            const editBtn = e.target.closest('.edit-btn');
            if (!editBtn) return;

            const cid = editBtn.dataset.card;
            const isSave = editBtn.textContent === 'Save';

            const ids = [
                `${cid}_status`, `${cid}_license`, `${cid}_tracking`,
                `${cid}_company`, `${cid}_address`, `${cid}_employee`,
                `${cid}_validity`, `${cid}_desc`
            ];

            ids.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;

                if (!isSave) {
                    el.innerHTML = `<input class="form-control" value="${escapeHtml(el.innerText)}">`;
                } else {
                    el.innerHTML = escapeHtml(el.querySelector('input')?.value || '');
                }
            });

            editBtn.textContent = isSave ? 'Edit' : 'Save';
        });
    }

    async function loadAndRender() {
        try {
            const selectedTicketId = getTicketIdFromUrl();

            const [tickets, companies, licenses, statuses, employees] = await Promise.all([
                fetchJson(api.tickets),
                fetchJson(api.companies),
                fetchJson(api.licenses),
                fetchJson(api.statuses),
                fetchJson(api.employees)
            ]);

            const maps = {
                companiesMap: Object.fromEntries(companies.map(c => [c.id, c.companyName])),
                licensesMap: Object.fromEntries(licenses.map(l => [l.id, l.appTypeName])),
                statusesMap: Object.fromEntries(statuses.map(s => [s.id, s.statusName])),
                employeesMap: Object.fromEntries(employees.map(e => [e.id, e.name]))
            };

            const sorted = tickets.sort((a, b) =>
                Date.parse(b.createdDate || 0) - Date.parse(a.createdDate || 0)
            );

            const container = qs('#dashboard');
            container.innerHTML = '';

            sorted.forEach((t, idx) => {
                container.insertAdjacentHTML(
                    'beforeend',
                    buildTicketCard(t, maps, idx)
                );
            });

            wireDelegatedHandlers(container);

            // 🔥 AUTO-FOCUS SELECTED TICKET
            if (selectedTicketId) {
                const el = container.querySelector(
                    `[data-ticket-id="${selectedTicketId}"]`
                );
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    el.classList.add('border', 'border-primary');
                }
            }

        } catch (err) {
            console.error('Failed to load tickets', err);
        }
    }

    document.addEventListener('DOMContentLoaded', loadAndRender);
})();
