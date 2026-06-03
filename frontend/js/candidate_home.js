document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.ruolo !== "candidato") {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

    await renderMyCard(user);
    await loadInterviews(user);
    setupCompanyModal();
    setupPasswordModal(user);
});

function isCandidateCvComplete(card) {
    return Boolean(card && card.bio && card.competenze && card.linguaggi && (card.luogo_preferito || card.disponibile_ovunque));
}

async function renderMyCard(user) {
    const cardSection = document.getElementById("myCardSection");
    try {
        const res = await fetch(`/api/cv/${user.id}`);
        const card = await res.json();

        if (!res.ok || !isCandidateCvComplete(card)) {
            window.location.href = "candidate.html";
            return;
        }

        cardSection.innerHTML = `
            ${DevCardsUI.renderCompactCard(card, {
                includeBack: true,
                wrapperId: "devcardFlip",
                qrId: "candidateHomeQr",
                contactMode: "full"
            })}
            <div class="click-to-flip">Clicca per girare</div>
            <a href="candidate.html" class="edit-btn">Modifica Profilo</a>
            <button type="button" class="edit-btn" id="btnPrintHomeCard" style="margin-top: 0.8rem;">Stampa DevCard</button>
        `;

        const wrapper = document.getElementById("devcardFlip");
        wrapper.addEventListener("click", event => {
            if (event.target.closest("[data-dc-contact-label]")) return;
            wrapper.classList.toggle("is-flipped");
        });

        const publicUrl = await DevCardsUI.getPublicProfileUrl(user.id);
        DevCardsUI.createQrCode("candidateHomeQr", publicUrl, 210);

        document.getElementById("btnPrintHomeCard").addEventListener("click", printCurrentDevCard);
    } catch (err) {
        console.error(err);
        cardSection.innerHTML = '<p style="color: #ff4b4b; text-align: center;">Errore di connessione.</p>';
    }
}

function printCurrentDevCard() {
    document.body.classList.add("card-print-page");
    window.addEventListener("afterprint", () => {
        document.body.classList.remove("card-print-page");
    }, { once: true });
    window.print();
}

async function loadInterviews(user) {
    const interviewsContainer = document.getElementById("interviewsContainer");
    try {
        const res = await fetch(`/api/candidate/interviews?candidate_id=${user.id}`);
        const interviews = await res.json();

        if (!Array.isArray(interviews) || interviews.length === 0) {
            interviewsContainer.innerHTML = '<p style="color: var(--text-muted);">Nessuna offerta di colloquio ricevuta al momento.</p>';
            return;
        }

        interviewsContainer.innerHTML = interviews.map(iv => {
            const status = renderStatus(iv.status);
            const actions = iv.status === "pending" ? `
                <div class="interview-actions">
                    <button class="btn-accept" data-id="${iv.id}" data-action="accepted">Accetta</button>
                    <button class="btn-reject" data-id="${iv.id}" data-action="rejected">Rifiuta</button>
                </div>
            ` : "";

            return `
                <div class="interview-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <h4 class="company-name" data-employer-id="${iv.employer_id}">${DevCardsUI.escapeHtml(iv.nome_azienda || `${iv.azienda_nome || ""} ${iv.azienda_cognome || ""}`.trim())}</h4>
                        ${status}
                    </div>
                    <div class="interview-meta">
                        <span>Ruolo: ${DevCardsUI.escapeHtml(iv.posizione_cercata || "N/D")}</span>
                        <span>Stipendio: ${DevCardsUI.escapeHtml(iv.range_stipendio || "Non specificato")}</span>
                        <span>Luogo: ${DevCardsUI.escapeHtml(iv.luogo || iv.azienda_citta || "N/D")} ${iv.distanza ? `(${DevCardsUI.escapeHtml(iv.distanza)})` : ""}</span>
                        <span style="width: 100%; margin-top: 0.3rem; color: var(--text-muted);">Data: ${iv.data_colloquio ? new Date(iv.data_colloquio).toLocaleDateString("it-IT") : "N/D"} alle ${iv.ora_colloquio ? iv.ora_colloquio.substring(0, 5) : "N/D"}</span>
                        ${iv.luogo_colloquio ? `<span style="width: 100%; margin-top: 0.3rem; color: var(--text-muted);">Colloquio presso: ${DevCardsUI.escapeHtml(iv.luogo_colloquio)}</span>` : ""}
                    </div>
                    ${iv.linguaggi_richiesti ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0;">Linguaggi: <span style="color: var(--text-main);">${DevCardsUI.escapeHtml(iv.linguaggi_richiesti)}</span></p>` : ""}
                    ${actions}
                </div>
            `;
        }).join("");

        document.querySelectorAll(".btn-accept, .btn-reject").forEach(btn => {
            btn.addEventListener("click", async function () {
                const interviewId = this.dataset.id;
                const status = this.dataset.action;
                try {
                    const res = await fetch("/api/interview/status", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ interview_id: interviewId, status })
                    });
                    if (res.ok) location.reload();
                } catch (err) {
                    console.error(err);
                }
            });
        });
    } catch (err) {
        console.error(err);
        interviewsContainer.innerHTML = '<p style="color: #ff4b4b;">Errore nel caricamento delle offerte.</p>';
    }
}

function renderStatus(status) {
    if (status === "accepted") return '<span class="status-badge status-accepted">Accettato</span>';
    if (status === "rejected") return '<span class="status-badge status-rejected">Rifiutato</span>';
    return '<span class="status-badge status-pending">In attesa</span>';
}

function setupCompanyModal() {
    let companyMapInstance = null;

    document.querySelectorAll(".company-name").forEach(el => {
        el.addEventListener("click", async function () {
            const empId = this.dataset.employerId;
            try {
                const res = await fetch(`/api/employer/${empId}`);
                const company = await res.json();
                const modalBody = document.getElementById("companyModalBody");
                modalBody.innerHTML = `
                    <h3 style="color: var(--primary-color); margin-bottom: 1rem;">${DevCardsUI.escapeHtml(company.nome_azienda || `${company.nome || ""} ${company.cognome || ""}`.trim())}</h3>
                    <p style="color: var(--text-muted-dark); margin-bottom: 0.5rem;">${DevCardsUI.escapeHtml(company.citta || "Citta non specificata")}</p>
                    ${company.lat && company.lon ? '<div id="companyMap" style="height: 200px; width: 100%; border-radius: 12px; margin-top: 1rem; border: 1px solid var(--card-border);"></div>' : ""}
                    <h4 class="devcard-section-label" style="margin-top: 1.5rem;">Descrizione</h4>
                    <p style="color: #333; line-height: 1.6;">${DevCardsUI.escapeHtml(company.descrizione_azienda || "Nessuna descrizione disponibile.")}</p>
                `;
                document.getElementById("companyModal").classList.add("active");

                if (companyMapInstance) {
                    companyMapInstance.remove();
                    companyMapInstance = null;
                }

                if (company.lat && company.lon && typeof L !== "undefined") {
                    setTimeout(() => {
                        companyMapInstance = L.map("companyMap").setView([company.lat, company.lon], 13);
                        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                            maxZoom: 19,
                            attribution: "OpenStreetMap"
                        }).addTo(companyMapInstance);
                        L.marker([company.lat, company.lon]).addTo(companyMapInstance)
                            .bindPopup(company.nome_azienda || company.nome)
                            .openPopup();
                    }, 50);
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    document.getElementById("closeCompanyModal").addEventListener("click", () => {
        document.getElementById("companyModal").classList.remove("active");
    });
}

function setupPasswordModal(user) {
    document.getElementById("btnChangePassword").addEventListener("click", () => {
        document.getElementById("changePasswordModal").classList.add("active");
        document.getElementById("pwdResult").innerHTML = "";
        document.getElementById("changePasswordForm").reset();
    });

    document.getElementById("closePwdModal").addEventListener("click", () => {
        document.getElementById("changePasswordModal").classList.remove("active");
    });

    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const resultEl = document.getElementById("pwdResult");

        if (newPassword !== confirmPassword) {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">Le due password non coincidono</span>';
            return;
        }

        try {
            const res = await fetch("/api/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                resultEl.innerHTML = `<span style="color: var(--primary-color);">${DevCardsUI.escapeHtml(data.message)}</span>`;
                document.getElementById("changePasswordForm").reset();
            } else {
                resultEl.innerHTML = `<span style="color: #ff4b4b;">${DevCardsUI.escapeHtml(data.error)}</span>`;
            }
        } catch {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">Errore di connessione al server.</span>';
        }
    });
}
