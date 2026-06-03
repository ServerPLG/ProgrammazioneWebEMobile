document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.ruolo !== "candidato") {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = "index.html";
        return;
    }

    const container = document.getElementById("cardContainer");
    loadMyCard(user.id, container);

    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

    const printBtn = document.getElementById("btnPrintCard");
    if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
    }
});

function hasProfileData(card) {
    return Boolean(card && (card.bio || card.competenze || card.linguaggi || card.competenze_linguistiche));
}

async function loadMyCard(userId, container) {
    try {
        const res = await fetch(`/api/cv/${userId}`);
        const card = await res.json();

        if (!res.ok || !hasProfileData(card)) {
            container.innerHTML = `
                <div class="empty-card-state">
                    <h3 style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;">CV non ancora compilato</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Per generare la tua DevCard, devi prima compilare il tuo CV.</p>
                    <a href="candidate.html" class="btn" style="display: inline-block; width: auto; padding: 0.8rem 2rem; text-decoration: none;">Compila il CV</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            ${DevCardsUI.renderCompactCard(card, {
                includeBack: true,
                wrapperId: "devcardWrapper",
                qrId: "candidateCardQr",
                contactMode: "full"
            })}
            <div class="click-to-flip">Clicca per girare</div>
        `;

        const wrapper = document.getElementById("devcardWrapper");
        wrapper.addEventListener("click", event => {
            if (event.target.closest("[data-dc-contact-label]")) return;
            wrapper.classList.toggle("is-flipped");
        });

        const publicUrl = await DevCardsUI.getPublicProfileUrl(userId);
        DevCardsUI.createQrCode("candidateCardQr", publicUrl, 210);
    } catch (error) {
        console.error("Errore caricamento card:", error);
        container.innerHTML = `
            <div class="empty-card-state">
                <h3 style="color: #ff4b4b; font-size: 1.5rem; margin-bottom: 1rem;">Errore di connessione</h3>
                <p style="color: var(--text-muted);">Impossibile caricare la tua DevCard. Assicurati che il server sia attivo.</p>
            </div>
        `;
    }
}
