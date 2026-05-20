// Eseguito appena carica l'HTML
document.addEventListener('DOMContentLoaded', async () => {
    // Uso URLSearchParams per prendere le scritte dopo il "?" nell'indirizzo (es. ?id=123)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id'); // Prendo il valore di "id"
    const container = document.getElementById('cardContainer');

    // Se nel link manca l'id (l'hanno aperto male) do errore
    if (!userId) {
        container.innerHTML = '<div style="color: red; text-align: center;">Errore: ID Utente mancante nel link.</div>';
        return;
    }

    try {
        // Faccio una chiamata all'API per avere il curriculum di quell'utente
        const res = await fetch(`/api/cv/${userId}`);
        
        // Se non trovo l'utente (es. id inventato)
        if (!res.ok) {
            container.innerHTML = '<div style="color: red; text-align: center;">Profilo non trovato o non ancora compilato.</div>';
            return;
        }

        const card = await res.json(); // Trasformo i dati ricevuti in un oggetto javascript
        
        // Se l'utente c'è ma non ha ancora messo la bio, stampo questo messaggio
        if (!card || !card.bio) {
            container.innerHTML = '<div style="color: var(--text-muted); text-align: center;">Questo candidato non ha ancora completato il suo profilo.</div>';
            return;
        }

        const langSpans = (card.linguaggi || '').split(',')
            .map(l => l.trim()).filter(l => l)
            .map(l => `<span class="lang-tag">${l}</span>`)
            .join('');

        // Parse competenze linguistiche
        let lingueHtml = '';
        try {
            const lingue = JSON.parse(card.competenze_linguistiche || '[]');
            lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
        } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

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
        <div style="position: relative;">
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
        `;

        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="color: red; text-align: center;">Errore di connessione al server.</div>';
    }
});
