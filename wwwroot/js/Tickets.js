// Edit Tickets
document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        const cid = btn.getAttribute("data-card");
        const isEditing = btn.textContent.trim() === "Save";

        const fields = [
            `${cid}_status`, `${cid}_license`, `${cid}_tracking`,
            `${cid}_company`, `${cid}_address`, `${cid}_employee`,
            `${cid}_validity`, `${cid}_desc`
        ];

        if (!isEditing) {
            fields.forEach(id => {
                const el = document.getElementById(id);
                const val = el.innerText.trim();

                if (id.endsWith("_desc") || id.endsWith("_address")) {
                    el.innerHTML = `<textarea class="form-control" rows="3">${val}</textarea>`;
                } else {
                    el.innerHTML = `<input class="form-control" value="${val}" />`;
                }
            });
            btn.textContent = "Save";
        } else {
            fields.forEach(id => {
                const el = document.getElementById(id);

                if (id.endsWith("_desc") || id.endsWith("_address")) {
                    const v = el.querySelector("textarea").value;
                    el.innerHTML = v;
                } else {
                    const v = el.querySelector("input").value;
                    el.innerHTML = v;
                }
            });
            btn.textContent = "Edit";
        }
    });
});

// Notes
document.querySelectorAll(".note-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        const cid = btn.getAttribute("data-card");
        const input = document.getElementById(`${cid}_noteInput`);
        const notesContainer = document.getElementById(`${cid}_notes`);

        const noteText = input.value.trim();
        if (!noteText) return;

        const now = new Date().toLocaleString();
        const div = document.createElement("div");
        div.style.cssText = "border-bottom:1px solid #ddd; padding:6px 0; font-size:0.85em;";
        div.innerHTML = `<strong style="color:#0f1445">${now}</strong><br>${noteText}`;

        if (notesContainer.innerHTML.includes("Notes will appear here")) {
            notesContainer.innerHTML = "";
        }

        notesContainer.insertBefore(div, notesContainer.firstChild);
        input.value = "";
    });
});

// Attachments Modal
const attachmentModal = new bootstrap.Modal(document.getElementById("attachmentsModal"));

document.querySelectorAll(".attach-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        document.getElementById("attachmentsList").innerHTML = `
                    <li class="list-group-item">PAN.pdf</li>
                    <li class="list-group-item">GSTIN.pdf</li>
                `;
        attachmentModal.show();
    });
});