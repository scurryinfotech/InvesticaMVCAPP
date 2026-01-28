(() => {
    const qs = (s, r = document) => r.querySelector(s);
    const api = {
        companies: '/companies',
        ticketById: id => `/tickets/${id}`
    };

    let allCompanies = [];

    function escapeHtml(s) {
        if (s == null) return '';
        return s.toString().replace(/[&<>"'`=\/]/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
        }[c]));
    }

    async function loadCompanies() {
        const select = qs('#selectCompany');
        const searchInput = qs('#companySearch');
        try {
            const res = await fetch(api.companies);
            if (!res.ok) throw new Error('Failed to load companies');
            const list = await res.json();
            allCompanies = list;

          
            populateDropdown(allCompanies);

            if (searchInput) searchInput.placeholder = 'Search company...';
        } catch (err) {
            if (searchInput) searchInput.placeholder = '(failed to load)';
            console.error(err);
        }
    }

    function populateDropdown(companies) {
        const select = qs('#selectCompany');
        select.innerHTML = '';

        if (companies.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No companies found';
            select.appendChild(opt);
        } else {
            companies.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.companyName || `#${c.id}`;
                select.appendChild(opt);
            });
        }
    }

    function filterCompanies() {
        const searchInput = qs('#companySearch');
        const searchTerm = (searchInput.value || '').toLowerCase().trim();

        if (!searchTerm) {
            populateDropdown(allCompanies);
        } else {
            const filtered = allCompanies.filter(c =>
                (c.companyName || '').toLowerCase().includes(searchTerm) ||
                String(c.id).includes(searchTerm)
            );
            populateDropdown(filtered);
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
        debugger
        const id = parseInt(raw, 10);
        if (Number.isNaN(id) || id <= 0) {
            out.innerHTML = '<div class="alert alert-danger">Ticket number must be a positive integer.</div>';
            return;
        }

        try {
            const res = await fetch(api.ticketById(id));

            if (res.status === 404) {
                alert(`Ticket ${raw} not found`);
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch ticket');

            const t = await res.json();

            window.location.href = `/Home/Tickets?ticketId=${t.id}`;

        } catch (err) {
            alert(`Error: ${err.message}`);
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

        // Searchable dropdown functionality
        const searchInput = qs('#companySearch');
        const select = qs('#selectCompany');
        const hiddenInput = qs('#selectedCompanyId');

        if (searchInput) {
            // Show dropdown with all companies when clicking on search input
            searchInput.addEventListener('click', () => {
                populateDropdown(allCompanies);
                select.style.display = 'block';
            });

            // Show dropdown with all companies when focusing on search input
            searchInput.addEventListener('focus', () => {
                populateDropdown(allCompanies);
                select.style.display = 'block';
            });

            // Filter as user types
            searchInput.addEventListener('input', () => {
                filterCompanies();
                select.style.display = 'block';
            });

            // Hide dropdown when clicking outside
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    select.style.display = 'none';
                }, 200);
            });
        }

        select.addEventListener('mousedown', (e) => {
            const option = e.target;
            if (option.tagName === 'OPTION' && option.value) {
                e.preventDefault(); 

                searchInput.value = option.textContent;
                hiddenInput.value = option.value;

                select.value = option.value;
                select.style.display = 'none';

                searchInput.focus(); 
            }
        });


        const btnNext = qs('#btnNext');
        if (btnNext) {
            btnNext.addEventListener('click', function (e) {
                const id = (hiddenInput?.value || '').trim();
                if (id) {
                    this.setAttribute('href', `/Home/Companies?companyId=${encodeURIComponent(id)}`);
                } else {
                    this.setAttribute('href', '/Home/Companies');
                }
            });
        }
    });
})();