document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    const container = document.getElementById("profileContainer");

    if (!userId) {
        container.innerHTML = '<div class="dc-profile-card"><p style="color: #ff4b4b;">Errore: ID utente mancante nel link.</p></div>';
        return;
    }

    try {
        const res = await fetch(`/api/cv/${userId}`);
        if (!res.ok) {
            container.innerHTML = '<div class="dc-profile-card"><p style="color: #ff4b4b;">Profilo non trovato o non ancora compilato.</p></div>';
            return;
        }

        const card = await res.json();
        container.innerHTML = DevCardsUI.renderFullProfile(card);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="dc-profile-card"><p style="color: #ff4b4b;">Errore di connessione al server.</p></div>';
    }
});
