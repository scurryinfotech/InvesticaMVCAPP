function loadFrontsheetData() {
    // From wizard
    const company = localStorage.getItem("sum_company") || "—";
    const address = localStorage.getItem("sum_address") || "—";

    document.getElementById("fs_name").innerText = company;
    document.getElementById("fs_address").innerText = address;

}

document.getElementById("frontsheetEditBtn").addEventListener("click", function () {

    const ids = [
        "fs_name", "fs_address", "fs_phone", "fs_email", "fs_director",
        "fs_entitytype", "fs_pan", "fs_business", "fs_epan",
        "fs_dob", "fs_gender", "fs_marital", "fs_family",
        "fs_area", "fs_ward", "fs_zone", "fs_product",
        "fs_source", "fs_sourcedby", "fs_comments",
        "fs_login", "fs_password", "fs_details",
        "fs_docname", "fs_docsign"
    ];

    const isEditing = this.innerText.includes("Save");

    if (!isEditing) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const val = el.innerText.trim();
            el.dataset.old = val;

            if (id === "fs_address" || id === "fs_director" || id === "fs_comments" || id === "fs_details") {
                el.innerHTML = `<textarea class="form-control" rows="2">${val}</textarea>`;
            } else {
                el.innerHTML = `<input class="form-control" value="${val}" />`;
            }
        });

        this.innerText = "Save Form";
        this.style.background = "#28a745";
    }
    else {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const input = el.querySelector("input");
            const textarea = el.querySelector("textarea");

            if (input) el.innerHTML = input.value;
            if (textarea) el.innerHTML = textarea.value;
        });

        this.innerText = "Edit Form";
        this.style.background = "#0f1445";
    }
});



document.addEventListener("DOMContentLoaded", loadFrontsheetData);

