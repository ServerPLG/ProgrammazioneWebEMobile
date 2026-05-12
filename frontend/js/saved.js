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
            if (filters.anniExpMin) queryParams.append('anniExpMin', filters.anniExpMin);
            if (filters.lingua) queryParams.append('lingua', filters.lingua);

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
                    `<span style="background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(0, 255, 102, 0.2);">${l}</span>`
                ).join('');

                const avatarHtml = card.foto_profilo 
                    ? `<img src="${card.foto_profilo}" alt="Foto" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">`
                    : `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">`;

                // Parse competenze linguistiche
                let lingueHtml = '';
                try {
                    const lingue = JSON.parse(card.competenze_linguistiche || '[]');
                    lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
                } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

                // Distanza
                const distanzaBadge = card.distanza 
                    ? `<span style="display: inline-block; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; border: 1px solid rgba(0, 255, 102, 0.2);">📍 ${card.distanza}</span>`
                    : '';

                const html = `
                <div class="glass-panel devcard" style="padding: 2rem; transition: all 0.3s ease;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        ${avatarHtml}
                        <div>
                            <h3 style="color: var(--text-main); font-size: 1.5rem; margin: 0;">${card.nome} ${card.cognome}, ${card.eta || '?'}</h3>
                            <p style="color: var(--text-muted); margin: 0; margin-top: 0.2rem;">📍 ${card.citta} · ${card.anni_esperienza} anni exp. ${distanzaBadge}</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${langSpans}
                    </div>
                    <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 120px;">
                            <h4 style="font-size: 0.8rem; color: var(--primary-color); margin-bottom: 0.3rem; text-transform: uppercase;">Luogo Preferito</h4>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">${card.disponibile_ovunque ? '🌍 Ovunque' : (card.luogo_preferito || 'Non specificato')}</p>
                            ${card.smartworking ? '<span style="display: inline-block; margin-top: 0.3rem; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; border: 1px solid rgba(0, 255, 102, 0.2);">✓ Smartworking</span>' : ''}
                        </div>
                        <div style="flex: 1; min-width: 120px;">
                            <h4 style="font-size: 0.8rem; color: var(--primary-color); margin-bottom: 0.3rem; text-transform: uppercase;">Lingue</h4>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">${lingueHtml}</p>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.5rem;">Competenze Tech</h4>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">${card.competenze || 'Non specificate'}</p>
                    </div>
                    <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 1.5rem; line-height: 1.5;">
                        ${card.bio || 'Nessuna biografia inserita.'}
                    </p>
                    <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                        <button class="btn btn-interview" data-id="${card.id}" data-name="${card.nome} ${card.cognome}" style="flex: 1; padding: 0.8rem; font-size: 0.9rem;">💼 Proponi Colloquio</button>
                        <button class="btn btn-contact" style="flex: 1; padding: 0.8rem; font-size: 0.9rem; background: transparent; border: 1px solid var(--text-muted); color: var(--text-main);" onclick="alert('Contatti Rivelati:\\nTelefono: ${card.telefono || 'N/D'}\\nInstagram: ${card.instagram || 'N/D'}')">📞 Contatta</button>
                    </div>
                </div>
                `;
                container.innerHTML += html;
            });

            // Attach interview button listeners
            document.querySelectorAll('.btn-interview').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.getElementById('interviewCandidateId').value = this.dataset.id;
                    document.getElementById('interviewCandidateName').textContent = this.dataset.name;
                    document.getElementById('interviewResult').innerHTML = '';
                    document.getElementById('interviewForm').reset();
                    document.getElementById('interviewModal').classList.add('active');
                });
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
        const anniExpMin = document.getElementById('filterExp').value;
        const lingua = document.getElementById('filterLingua').value;
        loadDevCards({ linguaggio, citta, anniExpMin, lingua });
    });

    // Interview Modal
    document.getElementById('closeInterviewModal').addEventListener('click', () => {
        document.getElementById('interviewModal').classList.remove('active');
    });

    document.getElementById('interviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const candidate_id = document.getElementById('interviewCandidateId').value;
        const posizione_cercata = document.getElementById('ivPosizione').value;
        const linguaggi_richiesti = document.getElementById('ivLinguaggi').value;
        const range_stipendio = document.getElementById('ivStipendio').value;
        const luogo = document.getElementById('ivLuogo').value;
        const resultEl = document.getElementById('interviewResult');

        try {
            const res = await fetch('http://localhost:3000/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employer_id: user.id,
                    candidate_id,
                    posizione_cercata,
                    linguaggi_richiesti,
                    range_stipendio,
                    luogo
                })
            });
            const data = await res.json();
            if (res.ok) {
                resultEl.innerHTML = `<span style="color: var(--primary-color);">✓ ${data.message}</span>`;
                setTimeout(() => {
                    document.getElementById('interviewModal').classList.remove('active');
                }, 1500);
            } else {
                resultEl.innerHTML = `<span style="color: #ff4b4b;">✗ ${data.error}</span>`;
            }
        } catch (err) {
            resultEl.innerHTML = `<span style="color: #ff4b4b;">Errore di connessione.</span>`;
        }
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
