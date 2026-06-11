document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.ruolo !== "datore") {
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = "index.html";
        return;
    }

    if (!user.nome_azienda || !user.descrizione_azienda || !user.citta) {
        window.location.href = "employer_profile.html";
        return;
    }

    const savedCards = new Map();

    async function loadDevCards(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("employer_id", user.id);
            if (filters.linguaggio) queryParams.append("linguaggio", filters.linguaggio);
            if (filters.citta) queryParams.append("citta", filters.citta);
            if (filters.anniExpMin) queryParams.append("anniExpMin", filters.anniExpMin);
            if (filters.lingua) queryParams.append("lingua", filters.lingua);

            const res = await fetch(`/api/devcards/saved?${queryParams.toString()}`);
            const devcards = await res.json();
            const container = document.getElementById("devcardsContainer");
            container.innerHTML = "";
            savedCards.clear();

            if (!Array.isArray(devcards) || devcards.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; font-size: 1.2rem; margin-top: 2rem;">Nessun candidato salvato trovato con questi filtri.</p>';
                return;
            }

            container.innerHTML = devcards.map(card => {
                savedCards.set(String(card.id), card);
                const fullName = `${card.nome || ""} ${card.cognome || ""}`.trim();
                return `
                    <div class="saved-card-item">
                        <div class="saved-card-click" data-profile-id="${card.id}" title="Visualizza profilo completo">
                            ${DevCardsUI.renderCompactCard(card, {
                                contactMode: "full",
                                showDistance: true
                            })}
                        </div>
                        <div class="saved-card-actions">
                            <button class="btn btn-interview" data-id="${card.id}" data-name="${DevCardsUI.escapeHtml(fullName)}">Proponi Colloquio</button>
                            <button class="btn-remove" data-id="${card.id}">Elimina</button>
                        </div>
                    </div>
                `;
            }).join("");

            bindSavedCardActions(loadDevCards, savedCards, user);
        } catch (error) {
            console.error(error);
            document.getElementById("devcardsContainer").innerHTML = '<p style="color:red; grid-column: 1/-1; text-align:center;">Errore di connessione al database.</p>';
        }
    }

    loadDevCards();

    document.getElementById("btnFilter").addEventListener("click", () => {
        loadDevCards({
            linguaggio: document.getElementById("filterLang").value,
            citta: document.getElementById("filterCity").value,
            anniExpMin: document.getElementById("filterExp").value,
            lingua: document.getElementById("filterLingua").value
        });
    });

    setupInterviewModal(user);
    setupCandidateProfileModal();

    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
});

function getTomorrowDateValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function bindSavedCardActions(loadDevCards, savedCards, user) {
    document.querySelectorAll(".saved-card-click").forEach(cardEl => {
        cardEl.addEventListener("click", event => {
            if (event.target.closest("[data-dc-contact-label]")) return;
            const card = savedCards.get(String(cardEl.dataset.profileId));
            if (!card) return;
            document.getElementById("savedCandidateProfileBody").innerHTML = DevCardsUI.renderFullProfile(card);
            document.getElementById("savedCandidateProfileModal").classList.add("active");
        });
    });

    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", async function () {
            if (!confirm("Rimuovere questo candidato dai preferiti?")) return;
            const candidate_id = this.dataset.id;
            try {
                const res = await fetch("/api/interact", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employer_id: user.id, candidate_id })
                });
                if (res.ok) {
                    loadDevCards();
                } else {
                    alert("Errore durante la rimozione.");
                }
            } catch {
                alert("Errore di connessione.");
            }
        });
    });

    document.querySelectorAll(".btn-interview").forEach(btn => {
        btn.addEventListener("click", function () {
            document.getElementById("interviewCandidateId").value = this.dataset.id;
            document.getElementById("interviewCandidateName").textContent = this.dataset.name;
            document.getElementById("interviewResult").innerHTML = "";
            document.getElementById("interviewForm").reset();
            document.getElementById("ivData").min = getTomorrowDateValue();
            document.getElementById("interviewModal").classList.add("active");
        });
    });
}

function setupCandidateProfileModal() {
    document.getElementById("closeSavedCandidateProfileModal").addEventListener("click", () => {
        document.getElementById("savedCandidateProfileModal").classList.remove("active");
    });

    document.getElementById("savedCandidateProfileModal").addEventListener("click", event => {
        if (event.target.id === "savedCandidateProfileModal") {
            document.getElementById("savedCandidateProfileModal").classList.remove("active");
        }
    });
}

function setupInterviewModal(user) {
    document.getElementById("ivData").min = getTomorrowDateValue();

    document.getElementById("closeInterviewModal").addEventListener("click", () => {
        document.getElementById("interviewModal").classList.remove("active");
    });

    document.getElementById("interviewForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const resultEl = document.getElementById("interviewResult");
        const interviewDate = document.getElementById("ivData").value;
        const firstValidDate = getTomorrowDateValue();

        if (interviewDate < firstValidDate) {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">La data del colloquio deve essere successiva a quella corrente.</span>';
            return;
        }

        try {
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employer_id: user.id,
                    candidate_id: document.getElementById("interviewCandidateId").value,
                    posizione_cercata: document.getElementById("ivPosizione").value,
                    linguaggi_richiesti: document.getElementById("ivLinguaggi").value,
                    range_stipendio: document.getElementById("ivStipendio").value,
                    luogo: document.getElementById("ivLuogo").value,
                    data_colloquio: interviewDate,
                    ora_colloquio: document.getElementById("ivOra").value,
                    luogo_colloquio: document.getElementById("ivLuogoColloquio").value
                })
            });
            const data = await res.json();
            if (res.ok) {
                resultEl.innerHTML = `<span style="color: var(--primary-color);">${DevCardsUI.escapeHtml(data.message)}</span>`;
                setTimeout(() => {
                    document.getElementById("interviewModal").classList.remove("active");
                }, 1200);
            } else {
                resultEl.innerHTML = `<span style="color: #ff4b4b;">${DevCardsUI.escapeHtml(data.error)}</span>`;
            }
        } catch {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">Errore di connessione.</span>';
        }
    });
}
