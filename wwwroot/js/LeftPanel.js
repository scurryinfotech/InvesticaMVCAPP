// LeftPanel.js — populate Company, License Type and Status from DB and make company input searchable.
// Uses APIs: /api/master/companies?page=1&pageSize=200, /api/master/licensetypes, /api/master/statuses

(function () {
    const qs = (s, r = document) => r.querySelector(s);
    const qsa = (s, r = document) => Array.from((r || document).querySelectorAll(s));

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
    }

    // makeSearchableDropdown accepts options array of either strings or { id, text }
    function makeSearchableDropdown(inputId, options) {
        const input = document.getElementById(inputId);
        if (!input) {
            console.log(`Element with id "${inputId}" not found`);
            return;
        }

        // remove any previously created wrapper to avoid double-init
        if (input.dataset.searchableInit === '1') return;
        input.dataset.searchableInit = '1';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const dropdown = document.createElement('div');
        dropdown.className = 'searchable-dropdown';
        Object.assign(dropdown.style, {
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            background: 'white',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'none',
            zIndex: '1050',
            marginTop: '2px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        });
        wrapper.appendChild(dropdown);

        function getText(opt) {
            return typeof opt === 'string' ? opt : (opt.text || opt.name || '');
        }
        function getId(opt) {
            return typeof opt === 'string' ? '' : (opt.id ?? '');
        }

        function populateDropdown(filterText = '') {
            dropdown.innerHTML = '';

            const filtered = options.filter(opt =>
                getText(opt).toLowerCase().includes(filterText.toLowerCase())
            );

            if (filtered.length === 0) {
                const noResult = document.createElement('div');
                noResult.textContent = 'No results found';
                Object.assign(noResult.style, { padding: '10px 12px', color: '#6c757d', textAlign: 'center' });
                dropdown.appendChild(noResult);
            } else {
                filtered.forEach(option => {
                    const text = getText(option);
                    const id = getId(option);
                    const item = document.createElement('div');
                    item.textContent = text;
                    Object.assign(item.style, { padding: '10px 12px', cursor: 'pointer' });

                    item.addEventListener('mouseenter', () => item.style.background = '#f0f0f0');
                    item.addEventListener('mouseleave', () => item.style.background = 'white');
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        input.value = text;
                        // expose selected id for downstream usage
                        input.dataset.selectedId = id || '';
                        // also set hidden input if present
                        const hidden = document.getElementById(inputId + 'Id');
                        if (hidden) hidden.value = id || '';
                        dropdown.style.display = 'none';
                    });
                    dropdown.appendChild(item);
                });
            }
        }

        input.addEventListener('focus', () => {
            populateDropdown(input.value);
            dropdown.style.display = 'block';
        });

        input.addEventListener('input', () => {
            // clear selected id while typing
            input.dataset.selectedId = '';
            const hidden = document.getElementById(inputId + 'Id');
            if (hidden) hidden.value = '';
            populateDropdown(input.value);
            dropdown.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) dropdown.style.display = 'none';
        });
    }

    // Populate <select> elements for license/status
    function populateSelect(selectId, items, placeholder) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(it => {
            const opt = document.createElement('option');
            opt.value = it.id;
            opt.textContent = (it.appTypeName || it.statusName || it.companyName || it.name || it.text || it);
            sel.appendChild(opt);
        });
    }

    async function initSearchableDropdowns() {
        try {
            // fetch lists in parallel
            const [companiesRes, licensesRes, statusesRes] = await Promise.all([
                fetchJson('/api/master/companies?page=1&pageSize=500'),
                fetchJson('/api/master/licensetypes'),
                fetchJson('/api/master/statuses')
            ]);

            // companiesRes is expected to be an array of CompanyMaster objects
            const companies = (companiesRes || []).map(c => ({ id: c.id, text: c.companyName || c.unikey || `#${c.id}` }));

            // license/status convert to {id, text} for select population
            const licenses = (licensesRes || []).map(l => ({ id: l.id, appTypeName: l.appTypeName }));
            const statuses = (statusesRes || []).map(s => ({ id: s.id, statusName: s.statusName }));

            // populate selects first so makeSearchableSelect can transform them
            populateSelect('licenseType', licenses, 'Select license type');
            populateSelect('status', statuses, 'Select status');

            // Now make searchable selects (existing function uses static options, so call after population)
            makeSearchableSelect('licenseType');
            makeSearchableSelect('status');

            // Now make company input searchable using companies array
            // Ensure an accompanying hidden input exists to hold selected company id
            const companyInput = qs('#companyName');
            if (companyInput) {
                // create hidden input if not present
                if (!qs('#companyNameId')) {
                    const hid = document.createElement('input');
                    hid.type = 'hidden';
                    hid.id = 'companyNameId';
                    hid.name = 'companyId';
                    companyInput.parentNode.insertBefore(hid, companyInput.nextSibling);
                }
                makeSearchableDropdown('companyName', companies);
            }

            // Also support frontsheet's company input if present
            const fsCompany = qs('#frontsheetCompany');
            if (fsCompany) {
                if (!qs('#frontsheetCompanyId')) {
                    const hid = document.createElement('input');
                    hid.type = 'hidden';
                    hid.id = 'frontsheetCompanyId';
                    hid.name = 'frontsheetCompanyId';
                    fsCompany.parentNode.insertBefore(hid, fsCompany.nextSibling);
                }
                makeSearchableDropdown('frontsheetCompany', companies);
            }

        } catch (err) {
            console.error('Failed to load master-data for left panel', err);
            // fallback to existing demo lists for company/location if API fails
            const companiesFallback = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Industries', 'Innovation Inc', 'Acme Corporation'];
            makeSearchableDropdown('companyName', companiesFallback);
            makeSearchableDropdown('frontsheetCompany', companiesFallback);
            const locations = ['New York', 'London', 'Tokyo', 'Mumbai', 'Singapore', 'Dubai', 'Paris', 'Berlin'];
            makeSearchableDropdown('location', locations);
            makeSearchableDropdown('frontsheetLocation', locations);
        }
    }

    // wire initialization on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchableDropdowns);
    } else {
        initSearchableDropdowns();
    }
})();
