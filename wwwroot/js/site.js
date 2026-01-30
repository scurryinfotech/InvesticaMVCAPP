document.addEventListener("DOMContentLoaded", function () {

    const tabsBar = document.getElementById("tabsBar");
    if (!tabsBar) return;
    const tabs = Array.from(tabsBar.querySelectorAll(".tab"));

    const normalize = p => {
        if (!p) return "/";
        try {
            const url = new URL(p, location.origin);
            p = url.pathname;
        } catch {
            /* keep p as-is */
        }
        p = p.replace(/\/+$/, "");
        return p === "" ? "/" : p.toLowerCase();
    };
    const normalizeText = t => (t || "").trim().toLowerCase();

    const defaultFlowKeywords = ['dashboard', 'tickets', 'invoice', 'fontsheet', 'links', 'renewals','admin panel'];
    const companyFlowKeywords = ['dashboard','companies','summary'];

    // Helper: does tab belong to a flow?
    function tabMatchesKeywords(tab, keywords) {
        const href = normalize(tab.getAttribute('href') || "");
        const txt = normalizeText(tab.textContent);
        if (!href && !txt) return false;
        // match href tokens
        for (const k of keywords) {
            if (href.includes(k.replace(/\s+/g, ''))) return true;
        }
        // match visible text
        for (const k of keywords) {
            if (txt.includes(k)) return true;
        }
        return false;
    }

    // Show/Hide tabs for a selected flow. Always keep Dashboard visible.
    function setFlow(showCompanyFlow) {
            debugger
        tabs.forEach(tab => {
            const isDashboard = normalizeText(tab.textContent).includes('dashboard') || (normalize(tab.getAttribute('href') || '').includes('/home') && normalize(tab.getAttribute('href') || '').endsWith('/dashboard'));
            const inCompanyFlow = tabMatchesKeywords(tab, companyFlowKeywords);
            const inDefaultFlow = tabMatchesKeywords(tab, defaultFlowKeywords);

            let shouldShow = false;
            if (isDashboard) shouldShow = true; // Dashboard always visible
            else if (showCompanyFlow) shouldShow = inCompanyFlow;
            else shouldShow = inDefaultFlow;

            tab.style.display = shouldShow ? "" : "none";
        });
    }

    // Initial active-tab logic (keeps parent tab active for subroutes)
    const currentPath = normalize(window.location.pathname);
    tabs.forEach(t => {
        t.classList.remove("active");
        t.removeAttribute("aria-current");
    });
    let matched = false;
    tabs.forEach(t => {
        const href = t.getAttribute("href") || "";
        const linkPath = normalize(href);
        const isMatch = linkPath === "/" ? currentPath === "/" : currentPath === linkPath || currentPath.startsWith(linkPath + "/");
        if (isMatch) {
            t.classList.add("active");
            t.setAttribute("aria-current", "page");
            matched = true;
        }
    });
    if (!matched && tabs.length > 0) {
        tabs[0].classList.add("active");
        tabs[0].setAttribute("aria-current", "page");
    }

    const persistedCompany = sessionStorage.getItem("companyFlowShown") === "1";

    setFlow(persistedCompany);

    // Expose API to change flow programmatically
    window.showCompanyFlow = () => {
        sessionStorage.setItem("companyFlowShown", "1");
        setFlow(true);
    };
    window.showDefaultFlow = () => {
        sessionStorage.removeItem("companyFlowShown");
        setFlow(false);
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="company-next"], .company-next, #companyNext, #btnNext');
        if (btn) {
            // switch to company flow and persist
            window.showCompanyFlow();
            // allow default navigation to proceed
        }
        // Optional: detect a 'reset' control to return to default flow (not required)
        const reset = e.target.closest('[data-action="company-reset"], .company-reset, #companyReset');
        if (reset) {
            window.showDefaultFlow();
        }
    });

    // Update active tab styling on click (visual only)
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.removeAttribute("aria-current");
            });
            this.classList.add("active");
            this.setAttribute("aria-current", "page");

            if (normalizeText(this.textContent).includes('dashboard')) {
                window.showDefaultFlow();
            }
        });
    });

    window.addEventListener('popstate', () => {
        const path = normalize(location.pathname);
        tabs.forEach(t => {
            t.classList.remove("active");
            t.removeAttribute("aria-current");
            const href = normalize(t.getAttribute('href') || "");
            if (href === path || path.startsWith(href + "/")) {
                t.classList.add("active");
                t.setAttribute("aria-current", "page");
            }
        });
    });

});