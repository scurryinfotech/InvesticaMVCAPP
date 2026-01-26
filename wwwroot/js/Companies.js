// Companies.js - load company info (name/logo) when companyId query param is provided
(() => {
    const qs = (s, r = document) => r.querySelector(s);
    const api = {
        companyById: id => `/companies/${id}`,
        companies: '/companies',
        licenses: '/licensetypes',
        statuses: '/statuses',
        documentData: id => `/document/${id}/data`
    };

    let currentCompany = null;

    function escapeHtml(s) {
        if (s == null) return '';
        return s.toString().replace(/[&<>"'`=\/]/g, c => ({
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

    async function loadLicenseTypes() {
        try {
            const list = await fetchJson(api.licenses);
            const sel = qs('#licenseTypeSelect');
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Select License Type --</option>';
            list.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = l.appTypeName || l.unikey || `#${l.id}`;
                sel.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function loadStatuses() {
        try {
            const list = await fetchJson(api.statuses);
            const sel = qs('#statusSelect');
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Select Status --</option>';
            list.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.statusName || s.unikey || `#${s.id}`;
                sel.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function loadCompanyById(id) {
        try {
            const company = await fetchJson(api.companyById(id));
            if (!company) return;
            currentCompany = company;
            const nameEl = qs('#companyName');
            if (nameEl) nameEl.textContent = company.companyName || `#${company.id}`;
            const unikeyEl = qs('#companyUnikey');
            if (unikeyEl) unikeyEl.textContent = company.unikey ? `Mapping: ${company.unikey}` : '';
            // If document id present, load image blob and show
            if (company.documentId) {
                try {
                    const res = await fetch(api.documentData(company.documentId));
                    if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const img = qs('#companyLogo');
                        if (img) {
                            img.src = url;
                            img.style.display = '';
                        }
                    }
                } catch (err) {
                    console.warn('Failed to load document image', err);
                }
            } else {
                const img = qs('#companyLogo');
                if (img) img.style.display = 'none';
            }
        } catch (err) {
            console.error(err);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        // Always load license types & statuses
        await Promise.all([loadLicenseTypes(), loadStatuses()]);

        const companyId = getQueryParam('companyId');
        if (companyId) {
            await loadCompanyById(companyId);
            // if there's an address in query, populate textarea so user sees it
            const qAddress = getQueryParam('address'); // URLSearchParams.get() returns decoded text already
            if (qAddress) {
                const addrEl = qs('#companyAddress');
                if (addrEl) addrEl.value = qAddress;
            }
        } else {
            // no companyId: keep default title/logo or optionally load default company
            const img = qs('#companyLogo');
            if (img && img.src && img.src.indexOf('placeholder-company.png') >= 0) {
                img.style.display = '';
            }
        }

        // Save handler: redirect to Other Details page with selected values
        const btnSave = qs('#btnSaveCompany');
        if (btnSave) {
            btnSave.addEventListener('click', (e) => {
                e.preventDefault();
                const selCompanyId = companyId || (currentCompany && currentCompany.id) || qs('#selectCompany')?.value || '';
                const licenseId = qs('#licenseTypeSelect') ? qs('#licenseTypeSelect').value : '';
                const statusId = qs('#statusSelect') ? qs('#statusSelect').value : '';
                const addressVal = qs('#companyAddress') ? qs('#companyAddress').value.trim() : '';

                // Persist into localStorage so back/forward preserves state
                if (selCompanyId) localStorage.setItem('wiz_companyId', selCompanyId);
                if (currentCompany && currentCompany.companyName) localStorage.setItem('wiz_companyName', currentCompany.companyName);
                if (addressVal) localStorage.setItem('wiz_address', addressVal);
                if (licenseId) localStorage.setItem('wiz_licenseId', licenseId);
                if (statusId) localStorage.setItem('wiz_statusId', statusId);

                // Build destination URL: OtherDetails reads query params but we also persisted the values
                const dest = '/Home/OtherDetails';
                const params = new URLSearchParams();
                if (selCompanyId) params.set('companyId', selCompanyId);
                if (licenseId) params.set('licenseTypeId', licenseId);
                if (statusId) params.set('statusId', statusId);
                if (addressVal) params.set('address', addressVal);

                const url = params.toString() ? `${dest}?${params.toString()}` : dest;

                // navigate
                window.location.href = url;
            });
        }

        const btnClear = qs('#btnClearCompany');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                const addr = qs('#companyAddress');
                if (addr) addr.value = '';
                const lt = qs('#licenseTypeSelect');
                if (lt) lt.value = '';
                const st = qs('#statusSelect');
                if (st) st.value = '';
            });
        }
    });
})();