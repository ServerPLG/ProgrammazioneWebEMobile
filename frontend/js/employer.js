// Appena la pagina è pronta eseguo questo codice
document.addEventListener('DOMContentLoaded', () => {
    // Controllo chi è l'utente salvato nel browser
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Se non c'è nessuno o è un candidato, non lo faccio entrare qui!
    if (!user || user.ruolo !== 'datore') {
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = 'index.html'; // Lo rimando al login
        return;
    }

    // Mi salvo due variabili: i candidati che riceverò e a che punto sono arrivato a scorrere
    let candidates = [];
    let currentIndex = 0;

    // Prendo gli elementi HTML per mostrare le carte e i bottoni
    const container = document.getElementById('activeCardContainer');
    const actionButtons = document.getElementById('actionButtons');

    // Funzione per scaricare i candidati dal server
    const loadDevCards = async () => {
        try {
            // Chiamo l'API passandogli il mio ID (così non mi fa vedere quelli che ho già scartato)
            const res = await fetch(`http://localhost:3000/api/devcards?employer_id=${user.id}`);
            candidates = await res.json(); // Salvo i risultati
            currentIndex = 0; // Riparto dal primo
            renderCard(); // Chiamo la funzione per disegnare la carta sullo schermo
        } catch (error) {
            console.error(error); // Se qualcosa va male scrivo in console
            container.innerHTML = '<div class="empty-state"><h3 style="color:red;">Errore di connessione al server</h3></div>';
        }
    };

    const renderCard = () => {
        if (currentIndex >= candidates.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3 style="color: var(--primary-color); font-size: 1.8rem; margin-bottom: 1rem;">Hai visto tutti i candidati!</h3>
                    <p style="color: var(--text-muted);">Non ci sono più profili disponibili al momento. Riprova più tardi.</p>
                </div>
            `;
            actionButtons.style.display = 'none';
            return;
        }

        const card = candidates[currentIndex];
        
        const langSpans = (card.linguaggi || '').split(',').map(l => l.trim()).filter(l=>l).map(l => 
            `<span style="background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(0, 255, 102, 0.2);">${l}</span>`
        ).join('');

        const avatarHtml = card.foto_profilo 
            ? `<img src="${card.foto_profilo}" alt="Foto" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">`
            : `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0" alt="Avatar" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">`;

        // Parse competenze linguistiche
        let lingueHtml = '';
        try {
            const lingue = JSON.parse(card.competenze_linguistiche || '[]');
            lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
        } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

        // Distanza
        const distanzaHtml = card.distanza 
            ? `<span style="display: inline-block; margin-top: 0.3rem; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.85rem; border: 1px solid rgba(0, 255, 102, 0.2);">📍 ${card.distanza}</span>`
            : '';

        const html = `
        <div class="glass-panel devcard" id="currentCard" style="animation: slideUp 0.4s ease-out;">
            <div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    ${avatarHtml}
                    <div>
                        <h3 style="color: var(--text-main); font-size: 2rem; margin: 0;">${card.nome} ${card.cognome}, ${card.eta || '?'}</h3>
                        <p style="color: var(--text-muted); font-size: 1.1rem; margin: 0; margin-top: 0.3rem;">📍 ${card.citta} · ${card.anni_esperienza} anni exp.</p>
                        ${distanzaHtml}
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem;">
                    ${langSpans}
                </div>
                <div style="margin-bottom: 1.5rem; display: flex; gap: 2rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 150px;">
                        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Luogo Preferito</h4>
                        <p style="font-size: 1rem; color: var(--text-main);">${card.disponibile_ovunque ? '🌍 Ovunque' : (card.luogo_preferito || 'Non specificato')}</p>
                        ${card.smartworking ? '<span style="display: inline-block; margin-top: 0.3rem; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; border: 1px solid rgba(0, 255, 102, 0.2);">✓ Smartworking</span>' : ''}
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Lingue</h4>
                        <p style="font-size: 1rem; color: var(--text-main);">${lingueHtml}</p>
                    </div>
                </div>
                <div style="margin-bottom: 2rem;">
                    <h4 style="font-size: 1rem; color: var(--primary-color); margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Competenze Tech</h4>
                    <p style="font-size: 1rem; color: var(--text-main); line-height: 1.6;">${card.competenze || 'Non specificate'}</p>
                </div>
                <div>
                    <h4 style="font-size: 1rem; color: var(--primary-color); margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Biografia</h4>
                    <p style="font-size: 1rem; color: #ccc; line-height: 1.6;">
                        ${card.bio || 'Nessuna biografia inserita.'}
                    </p>
                </div>
            </div>
        </div>
        `;
        
        container.innerHTML = html;
        actionButtons.style.display = 'flex';
    };

    // Funzione che gestisce quando clicco su "salva" o "scarta"
    const handleInteraction = async (action) => {
        if (currentIndex >= candidates.length) return; // Se ho finito non faccio niente
        
        const candidate = candidates[currentIndex]; // Prendo il candidato attuale
        
        const currentCard = document.getElementById('currentCard');
        if (currentCard) {
            // Faccio un'animazione carina per spostare la carta a destra (save) o sinistra (skip)
            currentCard.style.transform = action === 'save' ? 'translateX(100px) rotate(10deg)' : 'translateX(-100px) rotate(-10deg)';
            currentCard.style.opacity = '0'; // E la faccio svanire
        }

        fetch('http://localhost:3000/api/interact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employer_id: user.id,
                candidate_id: candidate.id,
                action: action
            })
        }).catch(err => console.error("Errore salvataggio interazione", err));

        setTimeout(() => {
            currentIndex++;
            renderCard();
        }, 300);
    };

    document.getElementById('btnSkip').addEventListener('click', () => handleInteraction('skip'));
    document.getElementById('btnSave').addEventListener('click', () => handleInteraction('save'));

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    loadDevCards();
});
