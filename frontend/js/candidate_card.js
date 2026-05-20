// Aspetto che si carichi la pagina HTML
document.addEventListener('DOMContentLoaded', () => {
    // Controllo dal localStorage se c'è un utente loggato e se è un candidato
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'candidato') {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = 'index.html'; // Lo caccio via
        return;
    }

    // Prendo il contenitore dove poi andrò a disegnare la carta
    const container = document.getElementById('cardContainer');

    // Chiamo la funzione per caricare i dati della carta
    loadMyCard(user.id, container);

    // Se l'utente clicca esci, cancello i dati salvati e torno alla home
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

// Questa funzione asincrona (await) serve per scaricare i dati della carta dal server
async function loadMyCard(userId, container) {
    try {
        const res = await fetch(`/api/cv/${userId}`);
        const card = await res.json(); // Trasformo in JSON

        // Se è andato storto qualcosa o non ha ancora messo la biografia...
        if (!res.ok || !card || !card.bio) {
            // ...scrivo un messaggio di errore nell'HTML
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

        const icons = {
            lingue: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            competenze: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
            esperienza: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            luogo: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            biografia: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
            phone: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
            email: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
            github: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
        };

        const formattedLingue = lingueHtml.split(',').map(l => `<div style="margin-bottom:0.2rem;">${l.trim()}</div>`).join('');

        const html = `
        <div class="scene">
            <div class="devcard-wrapper" id="devcardWrapper">
                <!-- Fronte -->
                <div class="devcard-face devcard-front">
                    <div style="position: relative;" id="captureArea">
                        <div class="glass-panel devcard devcard-layout" style="animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;">
                            
                            <!-- Header: Avatar + Nome + Age -->
                            <div class="card-header-top">
                                <div class="avatar-container">
                                    <img src="${avatarSrc}" alt="Foto Profilo" crossorigin="anonymous">
                                </div>
                                <div class="name-stack">
                                    <h3>${card.nome}<br>${card.cognome}</h3>
                                    <span class="age-label">${card.eta || '?'} ANNI</span>
                                </div>
                            </div>

                            <!-- Tech Tags -->
                            <div class="tech-tags-row">
                                ${langSpans}
                            </div>

                            <!-- Competenze -->
                            <div class="full-width-section" style="padding-top: 0.5rem; margin-top: 0.5rem; border: none;">
                                <h4 class="section-label-new">⚙ COMPETENZE</h4>
                                <div class="list-content">${card.competenze || 'Non specificate'}</div>
                            </div>

                            <!-- Grid: Lingue, Luogo, Esperienza -->
                            <div class="card-grid-main">
                                <div class="grid-col">
                                    <h4 class="section-label-new">🌐 LINGUE</h4>
                                    <div class="list-content">${formattedLingue}</div>
                                </div>
                                <div class="grid-col">
                                    <h4 class="section-label-new">📍 LUOGO</h4>
                                    <div class="list-content" style="font-weight: 700; text-transform: uppercase;">
                                        ${card.citta || 'N/D'}
                                    </div>
                                </div>
                                <div class="grid-col">
                                    <h4 class="section-label-new">⏱ ESPERIENZA</h4>
                                    <div class="list-content" style="font-weight: 700; text-transform: uppercase;">
                                        ${card.anni_esperienza} ANNI
                                        <div style="font-weight: 400; font-size: 0.75rem; margin-top: 0.1rem; color: var(--text-muted-dark);">Developer</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer Social -->
                            <div class="card-footer-social">
                                <div class="social-icons-group">
                                    <div class="social-icon" onclick="event.stopPropagation(); alert('Telefono: ${card.telefono || 'N/D'}')">${icons.phone}</div>
                                    <div class="social-icon" onclick="event.stopPropagation(); alert('Email: ${card.email || 'N/D'}')">${icons.email}</div>
                                    <div class="social-icon" onclick="event.stopPropagation(); alert('LinkedIn: ${card.linkedin || 'N/D'}')">${icons.linkedin}</div>
                                    <div class="social-icon" onclick="event.stopPropagation(); alert('GitHub: ${card.github || 'N/D'}')">${icons.github}</div>
                                </div>
                                <div class="designed-tag">DESIGNED BY DEVCARDS</div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Retro -->
                <div class="devcard-face devcard-back">
                    <h3 class="brand-font" style="color: var(--primary-color); font-size: 2rem; margin-bottom: 1.5rem; letter-spacing: 4px;">DEVCARDS</h3>
                    <div class="qr-container" id="qrcode" style="background: white; padding: 1.5rem; border-radius: 20px;"></div>
                    <p style="color: var(--text-muted-dark); font-size: 0.9rem; margin-top: 2rem; letter-spacing: 2px;">WWW.DEVCARDS.COM</p>
                </div>
            </div>
            <div class="click-to-flip">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"/></svg>
                Clicca per girare
            </div>
        </div>
        `;

        container.innerHTML = html;

        // Gestione Flip Animation
        const wrapper = document.getElementById('devcardWrapper');
        wrapper.parentElement.addEventListener('click', () => {
            wrapper.classList.toggle('is-flipped');
        });

        // Generazione del QR Code
        setTimeout(async () => {
            try {
                const ipRes = await fetch('/api/server-ip');
                const ipData = await ipRes.json();
                const serverIp = ipData.ip;
                const port = window.location.port ? `:${window.location.port}` : '';
                
                const publicUrl = `http://${serverIp}${port}/public_card.html?id=${userId}`;
                
                new QRCode(document.getElementById("qrcode"), {
                    text: publicUrl,
                    width: 220,
                    height: 220,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } catch (err) {
                console.error("Errore generazione QR:", err);
            }
        }, 700); // wait for slideUp animation to finish (aspetto 700ms)

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
