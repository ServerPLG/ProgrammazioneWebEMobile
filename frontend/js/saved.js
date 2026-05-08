document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'datore') {
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = 'index.html';
        return;
    }

    const loadDevCards = async (filters = {}) => {
        try {
            let queryParams = new URLSearchParams();
            queryParams.append('employer_id', user.id);
            if (filters.linguaggio) queryParams.append('linguaggio', filters.linguaggio);
            if (filters.citta) queryParams.append('citta', filters.citta);
            if (filters.etaMax) queryParams.append('etaMax', filters.etaMax);

            const res = await fetch(`http://localhost:3000/api/devcards/saved?${queryParams.toString()}`);
            const devcards = await res.json();

            const container = document.getElementById('devcardsContainer');
            container.innerHTML = '';

            if (devcards.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; font-size: 1.2rem; margin-top: 2rem;">Nessun candidato salvato trovato con questi filtri.</p>';
                return;
            }

            devcards.forEach(card => {
                const langSpans = (card.linguaggi || '').split(',').map(l => l.trim()).filter(l=>l).map(l => 
                    `<span style="background: rgba(0, 240, 255, 0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(0, 240, 255, 0.2);">${l}</span>`
                ).join('');

                const html = `
                <div class="glass-panel devcard" style="padding: 2rem; transition: all 0.3s ease;">
                    <h3 style="color: var(--text-main); font-size: 1.5rem; margin-bottom: 0.5rem;">${card.nome} ${card.cognome}, ${card.eta}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1rem;">📍 ${card.citta}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${langSpans}
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.5rem;">Competenze</h4>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">${card.competenze || 'Non specificate'}</p>
                    </div>
                    <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 1.5rem; line-height: 1.5;">
                        ${card.bio || 'Nessuna biografia inserita.'}
                    </p>
                    <button class="btn" style="width: 100%; background: transparent; border: 1px solid var(--text-muted); color: var(--text-main); transition: all 0.3s;" onclick="alert('Contatti Rivelati:\\nTelefono: ${card.telefono || 'N/D'}\\nInstagram: ${card.instagram || 'N/D'}\\nEmail: info@devcards.local')">Contatta</button>
                </div>
                `;
                container.innerHTML += html;
            });

        } catch (error) {
            console.error(error);
            document.getElementById('devcardsContainer').innerHTML = '<p style="color:red; grid-column: 1/-1; text-align:center;">Errore di connessione al database.</p>';
        }
    };

    // Initial load
    loadDevCards();

    // Filters logic
    document.getElementById('btnFilter').addEventListener('click', () => {
        const linguaggio = document.getElementById('filterLang').value;
        const citta = document.getElementById('filterCity').value;
        const etaMax = document.getElementById('filterAge').value;
        loadDevCards({ linguaggio, citta, etaMax });
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
