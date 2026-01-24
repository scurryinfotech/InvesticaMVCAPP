// Attach after DOM ready (include this file in _Layout.cshtml)
(function () {
    const tabs = document.querySelectorAll('header .tabs .tab');
    const dashboard = document.getElementById('dashboard');

    if (!tabs || !dashboard) return;

    // Map visible tab text -> controller action URL
    const routeMap = {
        'Dashboard': '/Home/Dashboard',
        'Companies': '/Home/Companies',
        'Frontsheet & Invoice': '/Home/FonstsheetAndInvoice',
        'Summary': '/Home/Summary',
        'TICKETS': '/Home/Tickets',
        'Invoice': '/Home/Invoice',
        'Frontsheet': '/Home/Fontsheet',
        'Links': '/Home/Links',
        'Renewals': '/Home/Renewals',
        'Master Data': '/Home/MasterData'
    };

    function setActive(el) {
        document.querySelectorAll('header .tabs .tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    }

    async function loadToDashboard(url, pushUrl) {
        try {
            const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!res.ok) {
                window.location.href = url; // fallback to full navigation
                return;
            }
            const html = await res.text();

            // parse the response and extract only the content area if present
            const tmp = document.createElement('div');
            tmp.innerHTML = html;

            // Prefer <main role="main"> content (layout uses this)
            const main = tmp.querySelector('main[role="main"]');
            if (main) {
                dashboard.innerHTML = main.innerHTML;
            } else {
                const fetchedHeader = tmp.querySelector('header');
                if (fetchedHeader) fetchedHeader.remove();
                // attempt to inject the remainder
            }

            if (pushUrl) history.pushState({ ajax: true }, '', pushUrl);

            // run any view init functions the injected content expects
            if (typeof initMD === 'function') initMD();
            if (typeof refreshModalInstances === 'function') refreshModalInstances();
        } catch (err) {
            console.error('Load failed, navigating:', err);
            window.location.href = url;
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabText = this.textContent.trim();
            const url = routeMap[tabText];

            setActive(this);

            if (!url) {
                // No mapping — optionally show default behaviour
                console.warn('No route mapped for tab:', tabText);
                return;
            }

            // For dashboard tab we might render client-side view; respect that
            if (tabText === 'Dashboard') {
                if (typeof showDashboardView === 'function') {
                    showDashboardView();
                    history.pushState({ ajax: true }, '', '/');
                    return;
                }
            }

            // Try AJAX load first; fallback to full navigation if server returns non-200
            loadToDashboard(url, url);
        });
    });

    // Handle browser back/forward for AJAX-loaded content
    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.ajax) {
            // reload current path via AJAX if mapped
            const path = location.pathname;
            const mapped = Object.values(routeMap).includes(path);
            if (mapped) loadToDashboard(path, null);
            else if (path === '/' || path.toLowerCase().includes('dashboard')) {
                if (typeof showDashboardView === 'function') showDashboardView();
            } else {
                // allow normal navigation
                window.location.href = path;
            }
        }
    });
})();