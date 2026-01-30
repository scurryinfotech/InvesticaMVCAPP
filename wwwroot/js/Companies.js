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
    let allLicenseTypes = [];
    let allStatuses = [];

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

    function populateLicenseDropdown(licenses) {
        const select = qs('#licenseTypeSelect');
        select.innerHTML = '';

        const activelicenses = licenses.filter(l  => l.isActive === true)

        if (activelicenses.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No license types found';
            select.appendChild(opt);
        } else {
            activelicenses.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = l.appTypeName || l.unikey || `#${l.id}`;
                select.appendChild(opt);
            });
        }
    }

    function populateStatusDropdown(statuses) {
        const select = qs('#statusSelect');
        select.innerHTML = '';

        
        const activeStatuses = statuses.filter(s => s.isActive === true);

        if (activeStatuses.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No active statuses found';
            select.appendChild(opt);
        } else {
            activeStatuses.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.statusName || s.unikey || `#${s.id}`;
                select.appendChild(opt);
            });
        }
    }

    function filterLicenseTypes() {
        const searchInput = qs('#licenseSearch');
        const searchTerm = (searchInput.value || '').toLowerCase().trim();

        const activelicenses = allLicenseTypes.filter(l => l.isActive === true);

        if (!searchTerm) {
            populateLicenseDropdown(activelicenses);
        } else {
            const filtered = activelicenses.filter(l =>
                (l.appTypeName || '').toLowerCase().includes(searchTerm) ||
                (l.unikey || '').toLowerCase().includes(searchTerm) ||
                String(l.id).includes(searchTerm)
            );
            populateLicenseDropdown(filtered);
        }
    }

    function filterStatuses() {
        const searchInput = qs('#statusSearch');
        const searchTerm = (searchInput.value || '').toLowerCase().trim();

        const activeStatuses = allStatuses.filter(s => s.isActive === true);

        if (!searchTerm) {
            populateStatusDropdown(activeStatuses);
        } else {
            const filtered = activeStatuses.filter(s =>
                (s.statusName || '').toLowerCase().includes(searchTerm) ||
                (s.unikey || '').toLowerCase().includes(searchTerm) ||
                String(s.id).includes(searchTerm)
            );
            populateStatusDropdown(filtered);
        }
    }

    async function loadLicenseTypes() {
        try {
            const list = await fetchJson(api.licenses);
            allLicenseTypes = list;
            populateLicenseDropdown(allLicenseTypes);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadStatuses() {
        try {
            const list = await fetchJson(api.statuses);
            allStatuses = list;
            populateStatusDropdown(allStatuses);
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

    function setupSearchableDropdown(searchInputId, selectId, hiddenInputId, filterFunction) {
        const searchInput = qs(searchInputId);
        const select = qs(selectId);
        const hiddenInput = qs(hiddenInputId);

        if (!searchInput || !select || !hiddenInput) return;

        searchInput.addEventListener('focus', () => {
            filterFunction();
            select.style.display = 'block';
        });

        searchInput.addEventListener('input', () => {
            filterFunction();
            select.style.display = 'block';
        });

        // IMPORTANT: select on mousedown (before blur)
        select.addEventListener('mousedown', (e) => {
            const option = e.target;
            if (option.tagName !== 'OPTION' || !option.value) return;

            e.preventDefault(); // stop blur race

            searchInput.value = option.textContent;
            hiddenInput.value = option.value;
            select.value = option.value;

            select.style.display = 'none';
            searchInput.blur();
        });

        // Safe blur
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                select.style.display = 'none';
            }, 150);
        });
    }


    document.addEventListener('DOMContentLoaded', async () => {
        // Always load license types & statuses
        await Promise.all([loadLicenseTypes(), loadStatuses()]);

        // Setup searchable dropdowns
        setupSearchableDropdown('#licenseSearch', '#licenseTypeSelect', '#selectedLicenseId', filterLicenseTypes);
        setupSearchableDropdown('#statusSearch', '#statusSelect', '#selectedStatusId', filterStatuses);

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
                const licenseId = qs('#selectedLicenseId') ? qs('#selectedLicenseId').value : '';
                const statusId = qs('#selectedStatusId') ? qs('#selectedStatusId').value : '';
                const addressVal = qs('#companyAddress') ? qs('#companyAddress').value.trim() : '';

                // Persist into localStorage so back/forward preserves state
                if (selCompanyId) localStorage.setItem('wiz_companyId', selCompanyId);
                if (currentCompany && currentCompany.companyName) localStorage.setItem('wiz_companyName', currentCompany.companyName);
                if (addressVal) localStorage.setItem('wiz_address', addressVal);
                if (licenseId) localStorage.setItem('wiz_licenseId', licenseId);
                const licenseDisplay = qs('#licenseSearch') ? qs('#licenseSearch').value : '';
                if (licenseDisplay) localStorage.setItem('wiz_license', licenseDisplay);
                if (statusId) localStorage.setItem('wiz_statusId', statusId);
                // also persist status display name
                const statusDisplay = qs('#statusSearch') ? qs('#statusSearch').value : '';
                if (statusDisplay) localStorage.setItem('wiz_status', statusDisplay);

                // Build destination URL: OtherDetails reads query params but we also persisted the values
                const dest = '/Home/Summary';
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
                const licenseSearch = qs('#licenseSearch');
                if (licenseSearch) licenseSearch.value = '';
                const statusSearch = qs('#statusSearch');
                if (statusSearch) statusSearch.value = '';
                const hiddenLicense = qs('#selectedLicenseId');
                if (hiddenLicense) hiddenLicense.value = '';
                const hiddenStatus = qs('#selectedStatusId');
                if (hiddenStatus) hiddenStatus.value = '';
            });
        }
    });
})();