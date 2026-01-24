document.addEventListener("DOMContentLoaded", function () {
    const tabsBar = document.getElementById("tabsBar");
    if (!tabsBar) return;
    const tabs = tabsBar.querySelectorAll(".tab");
    const currentPath = window.location.pathname.toLowerCase();
    tabs.forEach(t => t.classList.remove("active"));
    let matched = false;
    tabs.forEach(t => {
        const link = (t.getAttribute("href") || "").toLowerCase();

        if (currentPath === link || currentPath.startsWith(link)) {
            t.classList.add("active");
            matched = true;
        }
    });
    if (!matched && tabs.length > 0) {
        tabs[0].classList.add("active");
    }
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {

            tabs.forEach(t => t.classList.remove("active"));

            this.classList.add("active");
        });
    });
});