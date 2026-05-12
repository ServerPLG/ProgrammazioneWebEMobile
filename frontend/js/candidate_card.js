document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'candidato') {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('cardContainer');

    loadMyCard(user.id, container);

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

async function loadMyCard(userId, container) {
    try {
        const res = await fetch(`http://localhost:3000/api/cv/${userId}`);
        const card = await res.json();

        if (!res.ok || !card || !card.bio) {
            container.innerHTML = `
                <div class="empty-card-state">
                    <h3 style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;">📝 CV non ancora compilato</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Per generare la tua DevCard, devi prima compilare il tuo CV.</p>
                    <a href="candidate.html" class="btn" style="display: inline-block; width: auto; padding: 0.8rem 2rem; text-decoration: none;">Compila il CV</a>
                </div>
            `;
            return;
        }

        // Build language tags
        const langSpans = (card.linguaggi || '').split(',')
            .map(l => l.trim()).filter(l => l)
            .map(l => `<span class="lang-tag">${l}</span>`)
            .join('');

        // Parse competenze linguistiche (JSON)
        let lingueHtml = '';
        try {
            const lingue = JSON.parse(card.competenze_linguistiche || '[]');
            lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
        } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

        // Avatar
        const avatarSrc = card.foto_profilo 
            || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0`;

        const html = `
        <div class="scene">
            <div class="devcard-wrapper" id="devcardWrapper">
                <!-- Fronte -->
                <div class="devcard-face devcard-front">
                    <div style="position: relative;" id="captureArea">
                        <div class="card-glow"></div>
                        <div class="glass-panel devcard" style="animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;">
                            <div>
                                <!-- Header: Avatar + Nome -->
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                    <img src="${avatarSrc}" alt="Foto Profilo" class="devcard-avatar" crossorigin="anonymous">
                                    <div>
                                        <h3 style="color: var(--text-main); font-size: 2rem; margin: 0;">${card.nome} ${card.cognome}, ${card.eta || '?'}</h3>
                                        <p style="color: var(--text-muted); font-size: 1.1rem; margin: 0; margin-top: 0.3rem;">📍 ${card.citta} · ${card.anni_esperienza} anni exp.</p>
                                    </div>
                                </div>

                                <!-- Linguaggi -->
                                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem;">
                                    ${langSpans}
                                </div>

                                <!-- Luogo Preferito & Lingue -->
                                <div style="margin-bottom: 1.5rem; display: flex; gap: 2rem; flex-wrap: wrap;">
                                    <div style="flex: 1; min-width: 150px;">
                                        <h4 class="devcard-section-label">Luogo Preferito</h4>
                                        <p style="font-size: 1rem; color: var(--text-main);">${card.disponibile_ovunque ? '🌍 Ovunque' : (card.luogo_preferito || 'Non specificato')}</p>
                                        ${card.smartworking ? '<span class="smartworking-badge">✓ Smartworking</span>' : ''}
                                    </div>
                                    <div style="flex: 1; min-width: 150px;">
                                        <h4 class="devcard-section-label">Lingue</h4>
                                        <p style="font-size: 1rem; color: var(--text-main);">${lingueHtml}</p>
                                    </div>
                                </div>

                                <!-- Competenze -->
                                <div style="margin-bottom: 2rem;">
                                    <h4 class="devcard-section-label">Competenze Tech</h4>
                                    <p style="font-size: 1rem; color: var(--text-main); line-height: 1.6;">${card.competenze || 'Non specificate'}</p>
                                </div>

                                <!-- Biografia -->
                                <div>
                                    <h4 class="devcard-section-label">Biografia</h4>
                                    <p style="font-size: 1rem; color: #ccc; line-height: 1.6;">
                                        ${card.bio || 'Nessuna biografia inserita.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Retro -->
                <div class="devcard-face devcard-back">
                    <h3 style="color: var(--text-main); font-size: 1.5rem; margin-bottom: 1rem;">Scansiona la Card</h3>
                    <div class="qr-container" id="qrcode"></div>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Usa il QR Code per condividere e scaricare la tua DevCard.</p>
                </div>
            </div>
        </div>
        `;

        container.innerHTML = html;

        // Gestione Flip Animation
        const wrapper = document.getElementById('devcardWrapper');
        wrapper.parentElement.addEventListener('click', () => {
            wrapper.classList.toggle('is-flipped');
        });

        // Generazione Immagine e QR Code
        setTimeout(() => {
            try {
                // Utilizziamo l'IP locale
                let host = "192.168.1.181";
                const publicUrl = `http://${host}:3000/public_card.html?id=${userId}`;
                
                // Genera QR Code
                new QRCode(document.getElementById("qrcode"), {
                    text: publicUrl,
                    width: 180,
                    height: 180,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } catch (err) {
                console.error("Errore generazione QR:", err);
            }
        }, 700); // wait for slideUp animation to finish

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
