function applyRenewalFilters() {
    const lic = document.getElementById("filter_license").value.toUpperCase();
    const loc = document.getElementById("filter_location").value.toUpperCase();
    const comp = document.getElementById("filter_company").value.toUpperCase();
    const stat = document.getElementById("filter_status").value.toUpperCase();

    document.querySelectorAll("#renewalsBody tr").forEach(row => {
        let show = true;
        if (lic && !row.dataset.license.includes(lic)) show = false;
        if (loc && !row.dataset.location.includes(loc)) show = false;
        if (comp && !row.dataset.company.includes(comp)) show = false;
        if (stat && !row.dataset.status.includes(stat)) show = false;
        row.style.display = show ? "" : "none";
    });
}

function resetRenewalFilters() {
    document.getElementById("filter_license").value = "";
    document.getElementById("filter_location").value = "";
    document.getElementById("filter_company").value = "";
    document.getElementById("filter_status").value = "";
    applyRenewalFilters();
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("filter_license").addEventListener("change", applyRenewalFilters);
    document.getElementById("filter_location").addEventListener("change", applyRenewalFilters);
    document.getElementById("filter_company").addEventListener("keyup", applyRenewalFilters);
    document.getElementById("filter_status").addEventListener("change", applyRenewalFilters);
});