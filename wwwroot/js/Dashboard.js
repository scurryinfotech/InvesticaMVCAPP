(() => {
    const qs = (s, r = document) => r.querySelector(s);
    const api = {
        companies: '/companies',
        ticketById: id => `/tickets/${id}`
    };

    function escapeHtml(s) {
        if (s == null) return '';
        return s.toString().replace(/[&<>"'`=\/]/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
        }[c]));
    }

    async function loadCompanies() {
        const select = qs('#selectCompany');
        try {
            const res = await fetch(api.companies);
            if (!res.ok) throw new Error('Failed to load companies');
            const list = await res.json();
            select.innerHTML = '<option value="">-- Select company --</option>';
            list.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.companyName || `#${c.id}`;
                select.appendChild(opt);
            });
        } catch (err) {
            select.innerHTML = '<option value="">(failed to load)</option>';
            console.error(err);
        }
    }

    async function searchTicket() {
        const input = qs('#ticketNumber');
        const out = qs('#ticketResult');
        out.innerHTML = '';
        const raw = (input.value || '').trim();
        if (!raw) {
            out.innerHTML = '<div class="alert alert-info">Enter a ticket number to search.</div>';
            return;
        }
        const id = parseInt(raw, 10);
        if (Number.isNaN(id) || id <= 0) {
            out.innerHTML = '<div class="alert alert-danger">Ticket number must be a positive integer.</div>';
            return;
        }

        try {
            const res = await fetch(api.ticketById(id));
            if (res.status === 404) {
                out.innerHTML = `<div class="alert alert-warning">Ticket <strong>${escapeHtml(raw)}</strong> not found.</div>`;
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch ticket');
            const t = await res.json();
            out.innerHTML = `
                <div class="card border-secondary">
                    <div class="card-body">
                        <h5 class="card-title">Ticket #${escapeHtml(String(t.id))}</h5>
                        <p class="mb-1"><strong>Company:</strong> ${escapeHtml(String(t.companyId))}</p>
                        <p class="mb-1"><strong>Employee:</strong> ${escapeHtml(String(t.employeeId))}</p>
                        <p class="mb-1"><strong>License:</strong> ${escapeHtml(String(t.licenseId))}</p>
                        <p class="mb-1"><strong>Status:</strong> ${escapeHtml(String(t.statusId))}</p>
                        <p class="mb-1"><strong>TrackingNumber:</strong> ${escapeHtml(t.trackingNumber || '')}</p>
                        <p class="mb-1"><strong>Description:</strong> ${escapeHtml(t.description || '')}</p>
                        <div class="mt-2">
                            <a class="btn btn-sm btn-outline-primary" href="/Home/Tickets">Open Tickets</a>
                        </div>
                    </div>
                </div>`;
            if (t.companyId) {
                const sel = qs('#selectCompany');
                if (sel) sel.value = String(t.companyId);
            }
        } catch (err) {
            out.innerHTML = `<div class="alert alert-danger">Error: ${escapeHtml(err.message)}</div>`;
            console.error(err);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadCompanies();

        const btnSearch = qs('#btnSearchTicket');
        if (btnSearch) btnSearch.addEventListener('click', searchTicket);
        const input = qs('#ticketNumber');
        if (input) input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') searchTicket();
        });

        // Wire Next button to include selected companyId in querystring
        const btnNext = qs('#btnNext');
        const select = qs('#selectCompany');
        if (btnNext && select) {
            btnNext.addEventListener('click', function (e) {
                const id = (select.value || '').trim();
                if (id) {
                    // allow navigation but update href to include companyId
                    this.setAttribute('href', `/Home/Companies?companyId=${encodeURIComponent(id)}`);
                } else {
                    // no company selected — still navigate to companies without companyId
                    this.setAttribute('href', '/Home/Companies');
                }
                // default navigation continues
            });
        }
    });
})();