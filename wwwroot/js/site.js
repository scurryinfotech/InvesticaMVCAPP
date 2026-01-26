document.addEventListener("DOMContentLoaded", function () {

    const tabsBar = document.getElementById("tabsBar");
    if (!tabsBar) return;
    const tabs = Array.from(tabsBar.querySelectorAll(".tab"));

    // Normalize path (strip trailing slashes, lowercase)
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

    const currentPath = normalize(window.location.pathname);

    // Tab matching / active logic (keeps parent tab active for subroutes)
    tabs.forEach(t => {
        t.classList.remove("active");
        t.removeAttribute("aria-current");
    });

    let matched = false;
    tabs.forEach(t => {
        const href = t.getAttribute("href") || "";
        const linkPath = normalize(href);

        const isMatch =
            linkPath === "/"
                ? currentPath === "/"
                : currentPath === linkPath || currentPath.startsWith(linkPath + "/");

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

    // Company-related tabs to hide initially
    const companyTabsToToggle = [
        "/home/companies",
        "/home/fonstsheetandinvoice", // "Other Details" (matches your layout href)
        "/home/summary"
    ].map(normalize);

    function setCompanyTabsVisibility(show) {
        tabs.forEach(t => {
            const href = t.getAttribute("href") || "";
            const linkPath = normalize(href);
            if (companyTabsToToggle.includes(linkPath)) {
                t.style.display = show ? "" : "none";
            }
        });
    }

    // If user navigated directly to a company-related page, show the tabs
    const startedOnCompanyPage = companyTabsToToggle.includes(currentPath);

    // Persist showing across navigation after Next is clicked
    const persisted = sessionStorage.getItem("companyTabsShown") === "1";

    // Hide by default unless user is on one of those pages or already clicked Next earlier
    setCompanyTabsVisibility(startedOnCompanyPage || persisted);

    // Expose programmatic API and custom event so Dashboard can reveal tabs
    window.showCompanyTabs = () => {
        setCompanyTabsVisibility(true);
        sessionStorage.setItem("companyTabsShown", "1");
    };

    // Custom event support: dispatch from other scripts:
    // document.dispatchEvent(new CustomEvent('company:next'));
    document.addEventListener('company:next', () => window.showCompanyTabs());

    // Click delegation support: add one of these to your Dashboard "Next" button:
    // data-action="company-next"  OR class="company-next"  OR id="companyNext"
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="company-next"], .company-next, #companyNext');
        if (btn) {
            // reveal and persist for subsequent navigation
            window.showCompanyTabs();
        }
    });

    // Keep immediate UI feedback on tab click (does not prevent navigation)
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.removeAttribute("aria-current");
            });
            this.classList.add("active");
            this.setAttribute("aria-current", "page");
        });
    });
});