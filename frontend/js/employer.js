document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'datore') {
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = 'index.html';
        return;
    }

    let candidates = [];
    let currentIndex = 0;

    const container = document.getElementById('activeCardContainer');
    const actionButtons = document.getElementById('actionButtons');

    const loadDevCards = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/devcards?employer_id=${user.id}`);
            candidates = await res.json();
            currentIndex = 0;
            renderCard();
        } catch (error) {
            console.error(error);
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
            `<span style="background: rgba(0, 240, 255, 0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(0, 240, 255, 0.2);">${l}</span>`
        ).join('');

        // Notiamo che in questa view NON mostriamo il bottone "Contatta", che sarà nei Preferiti.
        const html = `
        <div class="glass-panel devcard" id="currentCard" style="animation: slideUp 0.4s ease-out;">
            <div>
                <h3 style="color: var(--text-main); font-size: 2rem; margin-bottom: 0.5rem;">${card.nome} ${card.cognome}, ${card.eta}</h3>
                <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">📍 ${card.citta}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem;">
                    ${langSpans}
                </div>
                <div style="margin-bottom: 2rem;">
                    <h4 style="font-size: 1rem; color: var(--primary-color); margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Competenze</h4>
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

    const handleInteraction = async (action) => {
        if (currentIndex >= candidates.length) return;
        
        const candidate = candidates[currentIndex];
        
        // Animazione della card in uscita (opzionale)
        const currentCard = document.getElementById('currentCard');
        if (currentCard) {
            currentCard.style.transform = action === 'save' ? 'translateX(100px) rotate(10deg)' : 'translateX(-100px) rotate(-10deg)';
            currentCard.style.opacity = '0';
        }

        // Manda richiesta al server in background
        fetch('http://localhost:3000/api/interact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employer_id: user.id,
                candidate_id: candidate.id,
                action: action
            })
        }).catch(err => console.error("Errore salvataggio interazione", err));

        // Passa al prossimo
        setTimeout(() => {
            currentIndex++;
            renderCard();
        }, 300); // aspetta la fine della transizione CSS
    };

    document.getElementById('btnSkip').addEventListener('click', () => handleInteraction('skip'));
    document.getElementById('btnSave').addEventListener('click', () => handleInteraction('save'));

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Avvia
    loadDevCards();
});
