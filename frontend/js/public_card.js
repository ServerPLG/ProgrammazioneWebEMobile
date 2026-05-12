document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const container = document.getElementById('cardContainer');

    if (!userId) {
        container.innerHTML = '<div style="color: red; text-align: center;">Errore: ID Utente mancante nel link.</div>';
        return;
    }

    try {
        const res = await fetch(`/api/cv/${userId}`);
        
        if (!res.ok) {
            container.innerHTML = '<div style="color: red; text-align: center;">Profilo non trovato o non ancora compilato.</div>';
            return;
        }

        const card = await res.json();
        
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

        const html = `
        <div style="position: relative;">
            <div class="card-glow"></div>
            <div class="glass-panel devcard" style="animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <img src="${avatarSrc}" alt="Foto Profilo" class="devcard-avatar">
                        <div>
                            <h3 style="color: var(--text-main); font-size: 2rem; margin: 0;">${card.nome} ${card.cognome}, ${card.eta || '?'}</h3>
                            <p style="color: var(--text-muted); font-size: 1.1rem; margin: 0; margin-top: 0.3rem;">📍 ${card.citta} · ${card.anni_esperienza} anni exp.</p>
                        </div>
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem;">
                        ${langSpans}
                    </div>

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

                    <div style="margin-bottom: 2rem;">
                        <h4 class="devcard-section-label">Competenze Tech</h4>
                        <p style="font-size: 1rem; color: var(--text-main); line-height: 1.6;">${card.competenze || 'Non specificate'}</p>
                    </div>

                    <div>
                        <h4 class="devcard-section-label">Biografia</h4>
                        <p style="font-size: 1rem; color: #ccc; line-height: 1.6;">
                            ${card.bio || 'Nessuna biografia inserita.'}
                        </p>
                    </div>
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
