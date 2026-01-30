document.addEventListener('DOMContentLoaded', async () => {
    // Helper to read fallback keys (sum_* preferred, else wiz_*)
    const read = (sumKey, wizKey) => {
        const s = localStorage.getItem(sumKey);
        if (s && s.trim() !== '') return s;
        const w = localStorage.getItem(wizKey);
        return w && w.trim() !== '' ? w : '';
    };

    // fields mapping: elementId -> [sumKey, wizKey]
    const map = {
        sCompany: ['sum_company', 'wiz_companyName'],
        sAddress: ['sum_address', 'wiz_address'],
        sPhone: ['sum_phone', 'wiz_phone'],
        sEmail: ['sum_email', 'wiz_email'],
        sGstin: ['sum_gstin', 'wiz_gstin'],
        sPan: ['sum_pan', 'wiz_pan'],
        sEntity: ['sum_entity', 'wiz_entity'],
        sProduct: ['sum_product', 'wiz_product'],
        sLocation: ['sum_location', 'wiz_location'],
        sLicense: ['sum_license', 'wiz_license'],
        sStatus: ['sum_status', 'wiz_status']
    };

    $(document).on('click', '#btnclose', () => {
        sessionStorage.removeItem('companyFlowShown');

        window.location.href = '/Home/Dashboard';
    });
    // populate UI
    Object.keys(map).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = read(map[id][0], map[id][1]) || '—';
    });

    // If no sum_ticket, show default
    if (!localStorage.getItem('sum_ticket')) {
        document.getElementById('sTicket').innerText = 'Auto-generated on save';
    } else {
        document.getElementById('sTicket').innerText = localStorage.getItem('sum_ticket');
    }

    // try to fetch company logo using persisted companyId (wiz_companyId)
    const companyId = localStorage.getItem('wiz_companyId') || null;
    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) return null;
        return res.json();
    }
    async function setLogoFromCompany(id) {
        try {
            const company = await fetchJson(`/companies/${id}`);
            if (!company) return;
            if (company.documentId) {
                const docRes = await fetch(`/document/${company.documentId}/data`);
                if (docRes && docRes.ok) {
                    const blob = await docRes.blob();
                    const url = URL.createObjectURL(blob);
                    const img = document.getElementById('sLogo');
                    img.src = url;
                    img.style.display = '';
                }
            }
        } catch (err) {
            console.warn('Failed to load company logo', err);
        }
    }
    if (companyId) {
        setLogoFromCompany(companyId);
    }

    // Ensure Create Ticket button reads the same persisted values when submitting
    const btn = document.getElementById('btnCreateTicket');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Prefer the centralized createTicket implementation (delegated handler)
            if (typeof window.createTicketFromSummary === 'function') {
                window.createTicketFromSummary();
                return;
            }
            // Fallback: clear company flow flag so site.js shows default tabs, then redirect to Dashboard
            try { sessionStorage.removeItem('companyFlowShown'); } catch (err) { /* ignore */ }
            setTimeout(() => { window.location.href = '/Home/Dashboard'; }, 150);
        });
    }
    // Submits ticket using POST /tickets, clears wizard state and resets navigation to default, then navigates to Tickets.
    (() => {
        const qs = s => document.querySelector(s);

        const read = (sumKey, wizKey) => {
            const s = localStorage.getItem(sumKey);
            if (s && s.trim() !== '') return s;
            const w = localStorage.getItem(wizKey);
            return w && w.trim() !== '' ? w : '';
        };

        const toIntOrNull = (v) => {
            if (!v) return null;
            const n = parseInt(v, 10);
            return Number.isNaN(n) ? null : n;
        };

        const showAlert = (msg, type = 'success') => {
            const el = document.createElement('div');
            el.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
            el.style.zIndex = 2000;
            el.textContent = msg;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        };

        async function createTicket() {
            const payload = {
                CompanyId: toIntOrNull(localStorage.getItem('wiz_companyId')),
                EmployeeId: toIntOrNull(localStorage.getItem('wiz_employeeId')) || 1,
                LicenseId: toIntOrNull(localStorage.getItem('wiz_licenseId')),
                StatusId: toIntOrNull(localStorage.getItem('wiz_statusId')),
                CompanyAddress: (localStorage.getItem('sum_address') || localStorage.getItem('wiz_address') || ''),
                Description: read('sum_description', 'wiz_description') || '',
                TrackingNumber: read('sum_tracking', 'wiz_tracking') || null,
                ValidTill: null,
                CreatedDate: new Date().toISOString(),
                CreatedBy: toIntOrNull(localStorage.getItem('wiz_createdBy')) || 1,
                ModifiedDate: null,
                ModifiedBy: null
            };

            try {
                const res = await fetch('/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.status === 201 || res.ok) {
                    let data = null;
                    try { data = await res.json(); } catch { /* ignore */ }
                    const createdId = data && (data.id || data.Id) ? (data.id || data.Id) : null;

                    if (createdId) {
                        localStorage.setItem('createdTicketId', createdId);

                        // Simple modal
                        const modal = document.createElement('div');
                        modal.innerHTML = `
        <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Ticket Created</h5>
                    </div>
                    <div class="modal-body text-center p-4">
                        <p>Your Ticket ID:</p>
                        <h2 class="text-primary">${createdId}</h2>
                    </div>
                    <button type="button" id="btnclose" class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
                        document.body.appendChild(modal);
                    } else {
                        showAlert('Ticket created', 'success');
                    }

                    return;
                }

                const text = await res.text();
                showAlert(`Create failed: ${text || res.statusText}`, 'danger');
            } catch (err) {
                console.error(err);
                showAlert('Error creating ticket', 'danger');
            }
        }



        // Delegate clicks so handler works regardless of load order
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#btnCreateTicket, #btnCreate');
            if (!btn) return;
            e.preventDefault();
            createTicket();
        });

        // Also provide function in window so other scripts can call it
        window.createTicketFromSummary = createTicket;
    })();
});