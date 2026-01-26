// Editable OtherDetails view: initialize from URL or localStorage, persist changes, and expose goSummary()
(() => {
    const LS = {
        COMPANY_ID: 'wiz_companyId',
        COMPANY_NAME: 'wiz_companyName',
        ADDRESS: 'wiz_address',
        PHONE: 'wiz_phone',
        EMAIL: 'wiz_email',
        GSTIN: 'wiz_gstin',
        PAN: 'wiz_pan',
        ENTITY: 'wiz_entity',
        PRODUCT: 'wiz_product',
        LOCATION: 'wiz_location',
        LICENSE_ID: 'wiz_licenseId',
        LICENSE: 'wiz_license',
        STATUS_ID: 'wiz_statusId',
        STATUS: 'wiz_status'
    };

    const qs = sel => document.querySelector(sel);
    const qv = id => (qs(`#${id}`) ? qs(`#${id}`).value : '');
    const set = (id, v) => { const el = qs(`#${id}`); if (el) el.value = v ?? ''; };
    const persist = (key, value) => { if (value === null || value === undefined) localStorage.removeItem(key); else localStorage.setItem(key, String(value)); };
    const getLS = key => localStorage.getItem(key);

    const api = {
        companyById: id => `/companies/${id}`,
        licenses: '/licensetypes',
        statuses: '/statuses'
    };

    function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        return res.json();
    }

    async function loadLookups() {
        // populate license and status selects
        try {
            const [licenses, statuses] = await Promise.all([
                fetchJson(api.licenses),
                fetchJson(api.statuses)
            ]);
            const licSel = qs('#fs_licenseSelect');
            const stSel = qs('#fs_statusSelect');
            if (licSel) {
                licSel.innerHTML = '<option value="">-- Select License Type --</option>';
                licenses.forEach(l => {
                    const opt = document.createElement('option');
                    opt.value = l.id;
                    opt.text = l.appTypeName || l.unikey || `#${l.id}`;
                    licSel.appendChild(opt);
                });
            }
            if (stSel) {
                stSel.innerHTML = '<option value="">-- Select Status --</option>';
                statuses.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.id;
                    opt.text = s.statusName || s.unikey || `#${s.id}`;
                    stSel.appendChild(opt);
                });
            }
        } catch (err) {
            console.warn('Failed to load lookups', err);
        }
    }

    async function loadCompany(id) {
        if (!id) return null;
        try {
            return await fetchJson(api.companyById(id));
        } catch {
            return null;
        }
    }

    function applySavedValuesToUI() {
        set('fs_company', getLS(LS.COMPANY_NAME) || '');
        set('fs_address', getLS(LS.ADDRESS) || '');
        set('fs_phone', getLS(LS.PHONE) || '');
        set('fs_email', getLS(LS.EMAIL) || '');
        set('fs_gstin', getLS(LS.GSTIN) || '');
        set('fs_pan', getLS(LS.PAN) || '');
        set('fs_entity', getLS(LS.ENTITY) || '');
        set('fs_product', getLS(LS.PRODUCT) || '');
        set('fs_location', getLS(LS.LOCATION) || '');
        // select values
        const licId = getLS(LS.LICENSE_ID);
        const stId = getLS(LS.STATUS_ID);
        if (licId && qs('#fs_licenseSelect')) qs('#fs_licenseSelect').value = licId;
        if (stId && qs('#fs_statusSelect')) qs('#fs_statusSelect').value = stId;
    }

    function wireChangeHandlers() {
        // persist on change
        const map = [
            { id: 'fs_company', key: LS.COMPANY_NAME },
            { id: 'fs_address', key: LS.ADDRESS },
            { id: 'fs_phone', key: LS.PHONE },
            { id: 'fs_email', key: LS.EMAIL },
            { id: 'fs_gstin', key: LS.GSTIN },
            { id: 'fs_pan', key: LS.PAN },
            { id: 'fs_entity', key: LS.ENTITY },
            { id: 'fs_product', key: LS.PRODUCT },
            { id: 'fs_location', key: LS.LOCATION }
        ];
        map.forEach(m => {
            const el = qs(`#${m.id}`);
            if (!el) return;
            el.addEventListener('input', () => {
                persist(m.key, el.value || '');
                // mirror to summary keys used previously
                if (m.key === LS.COMPANY_NAME) localStorage.setItem('sum_company', el.value || '');
                if (m.key === LS.ADDRESS) localStorage.setItem('sum_address', el.value || '');
            });
        });

        const licSel = qs('#fs_licenseSelect');
        if (licSel) {
            licSel.addEventListener('change', () => {
                const idx = licSel.selectedIndex;
                const label = idx >= 0 ? licSel.options[idx].text : '';
                persist(LS.LICENSE_ID, licSel.value || '');
                persist(LS.LICENSE, label || '');
                localStorage.setItem('sum_license', label || '');
            });
        }

        const stSel = qs('#fs_statusSelect');
        if (stSel) {
            stSel.addEventListener('change', () => {
                const idx = stSel.selectedIndex;
                const label = idx >= 0 ? stSel.options[idx].text : '';
                persist(LS.STATUS_ID, stSel.value || '');
                persist(LS.STATUS, label || '');
                localStorage.setItem('sum_status', label || '');
            });
        }
    }

    // Save all visible values (called before navigation)
    function saveAll() {
        // basic fields
        persist(LS.COMPANY_NAME, qv('fs_company'));
        persist(LS.ADDRESS, qv('fs_address'));
        persist(LS.PHONE, qv('fs_phone'));
        persist(LS.EMAIL, qv('fs_email'));
        persist(LS.GSTIN, qv('fs_gstin'));
        persist(LS.PAN, qv('fs_pan'));
        persist(LS.ENTITY, qv('fs_entity'));
        persist(LS.PRODUCT, qv('fs_product'));
        persist(LS.LOCATION, qv('fs_location'));

        // license/status selects
        const licSel = qs('#fs_licenseSelect');
        if (licSel) {
            const idx = licSel.selectedIndex;
            const label = idx >= 0 ? licSel.options[idx].text : '';
            persist(LS.LICENSE_ID, licSel.value || '');
            persist(LS.LICENSE, label || '');
            localStorage.setItem('sum_license', label || '');
        }
        const stSel = qs('#fs_statusSelect');
        if (stSel) {
            const idx = stSel.selectedIndex;
            const label = idx >= 0 ? stSel.options[idx].text : '';
            persist(LS.STATUS_ID, stSel.value || '');
            persist(LS.STATUS, label || '');
            localStorage.setItem('sum_status', label || '');
        }

        // mirror for summary page keys
        localStorage.setItem('sum_company', qv('fs_company') || '');
        localStorage.setItem('sum_address', qv('fs_address') || '');
    }

    // Called by view when Next clicked
    window.goSummary = async function () {
        saveAll();
        // keep companyId persisted if present in URL
        const qCompanyId = getQueryParam('companyId');
        if (qCompanyId) localStorage.setItem(LS.COMPANY_ID, qCompanyId);
        // navigate to summary
        window.location.href = '/Home/Summary';
    };

    // initialization sequence
    document.addEventListener('DOMContentLoaded', async () => {
        await loadLookups();

        // Priority: URL params > localStorage
        const qCompanyId = getQueryParam('companyId');
        const qAddress = getQueryParam('address');
        const qLicenseId = getQueryParam('licenseTypeId');
        const qStatusId = getQueryParam('statusId');

        // If companyId provided, fetch company and set name
        if (qCompanyId) {
            const company = await loadCompany(qCompanyId);
            if (company && company.companyName) {
                set('fs_company', company.companyName);
                persist(LS.COMPANY_NAME, company.companyName);
                localStorage.setItem('sum_company', company.companyName);
            }
            // persist company id
            persist(LS.COMPANY_ID, qCompanyId);
        } else if (getLS(LS.COMPANY_NAME)) {
            set('fs_company', getLS(LS.COMPANY_NAME));
        }

        // address from url or localStorage
        if (qAddress) {
            set('fs_address', qAddress);
            persist(LS.ADDRESS, qAddress);
            localStorage.setItem('sum_address', qAddress);
        } else if (getLS(LS.ADDRESS)) {
            set('fs_address', getLS(LS.ADDRESS));
        }

        // license/status selection by id from URL or localStorage
        if (qLicenseId && qs('#fs_licenseSelect')) qs('#fs_licenseSelect').value = qLicenseId;
        else if (getLS(LS.LICENSE_ID) && qs('#fs_licenseSelect')) qs('#fs_licenseSelect').value = getLS(LS.LICENSE_ID);

        if (qStatusId && qs('#fs_statusSelect')) qs('#fs_statusSelect').value = qStatusId;
        else if (getLS(LS.STATUS_ID) && qs('#fs_statusSelect')) qs('#fs_statusSelect').value = getLS(LS.STATUS_ID);

        // apply any remaining saved simple fields
        applySavedValuesToUI();

        // wire change handlers to persist live
        wireChangeHandlers();
    });
})();