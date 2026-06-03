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

    let candidates = [];
    let currentIndex = 0;

    const container = document.getElementById("activeCardContainer");
    const actionButtons = document.getElementById("actionButtons");

    async function loadDevCards() {
        try {
            const res = await fetch(`/api/devcards?employer_id=${user.id}`);
            candidates = await res.json();
            currentIndex = 0;
            renderCard();
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div class="empty-state"><h3 style="color:red;">Errore di connessione al server</h3></div>';
        }
    }

    function renderCard() {
        if (currentIndex >= candidates.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3 style="color: var(--primary-color); font-size: 1.8rem; margin-bottom: 1rem;">Hai visto tutti i candidati!</h3>
                    <p style="color: var(--text-muted);">Non ci sono piu profili disponibili al momento. Riprova piu tardi.</p>
                </div>
            `;
            actionButtons.style.display = "none";
            return;
        }

        const card = candidates[currentIndex];
        container.innerHTML = `
            <div class="discovery-card-stack">
                ${DevCardsUI.renderCompactCard(card, {
                    cardId: "currentCard",
                    contactMode: "full",
                    showDistance: true
                })}
                <button type="button" class="profile-view-btn" id="btnViewProfile">Visualizza profilo</button>
            </div>
        `;

        document.getElementById("btnViewProfile").addEventListener("click", () => openCandidateProfile(card));
        actionButtons.style.display = "flex";
    }

    async function handleInteraction(action) {
        if (currentIndex >= candidates.length) return;

        const candidate = candidates[currentIndex];
        const currentCard = document.getElementById("currentCard");
        if (currentCard) {
            currentCard.style.transform = action === "save" ? "translateX(120px) rotate(10deg)" : "translateX(-120px) rotate(-10deg)";
            currentCard.style.opacity = "0";
        }

        fetch("/api/interact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                employer_id: user.id,
                candidate_id: candidate.id,
                action
            })
        }).catch(err => console.error("Errore salvataggio interazione", err));

        setTimeout(() => {
            currentIndex++;
            renderCard();
        }, 300);
    }

    function openCandidateProfile(card) {
        document.getElementById("candidateProfileBody").innerHTML = DevCardsUI.renderFullProfile(card);
        document.getElementById("candidateProfileModal").classList.add("active");
    }

    document.getElementById("closeCandidateProfileModal").addEventListener("click", () => {
        document.getElementById("candidateProfileModal").classList.remove("active");
    });

    document.getElementById("candidateProfileModal").addEventListener("click", event => {
        if (event.target.id === "candidateProfileModal") {
            document.getElementById("candidateProfileModal").classList.remove("active");
        }
    });

    document.getElementById("btnSkip").addEventListener("click", () => handleInteraction("skip"));
    document.getElementById("btnSave").addEventListener("click", () => handleInteraction("save"));

    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

    setupPasswordModal(user);
    loadDevCards();
});

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
