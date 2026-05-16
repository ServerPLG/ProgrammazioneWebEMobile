// Appena la pagina è pronta (DOMContentLoaded) eseguo questa mega funzione
document.addEventListener('DOMContentLoaded', () => {
    // Controllo chi è loggato prendendolo dalla memoria del browser (localStorage)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'datore') { // Se non c'è, o non è il boss (datore), lo caccio
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = 'index.html';
        return;
    }

    // Questa funzione scarica i candidati salvati, accetta anche dei "filtri" opzionali
    const loadDevCards = async (filters = {}) => {
        try {
            // Uso URLSearchParams per costruire i "pezzi" dell'indirizzo API in modo intelligente
            let queryParams = new URLSearchParams();
            queryParams.append('employer_id', user.id); // Dico all'API di darmi quelli salvati da me (il mio ID)
            // Se ho scritto qualcosa nei filtri (città, linguaggi...) li aggiungo all'indirizzo
            if (filters.linguaggio) queryParams.append('linguaggio', filters.linguaggio);
            if (filters.citta) queryParams.append('citta', filters.citta);
            if (filters.anniExpMin) queryParams.append('anniExpMin', filters.anniExpMin);
            if (filters.lingua) queryParams.append('lingua', filters.lingua);

            // Chiamo l'API con l'indirizzo costruito e aspetto la risposta (await)
            const res = await fetch(`/api/devcards/saved?${queryParams.toString()}`);
            const devcards = await res.json(); // Trasformo in JSON

            const container = document.getElementById('devcardsContainer');
            container.innerHTML = '';

            if (devcards.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; font-size: 1.2rem; margin-top: 2rem;">Nessun candidato salvato trovato con questi filtri.</p>';
                return;
            }

            devcards.forEach(card => {
                const langSpans = (card.linguaggi || '').split(',').map(l => l.trim()).filter(l => l).map(l =>
                    `<span style="background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(0, 255, 102, 0.2);">${l}</span>`
                ).join('');

                const avatarHtml = card.foto_profilo
                    ? `<img src="${card.foto_profilo}" alt="Foto" crossorigin="anonymous">`
                    : `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0" alt="Avatar">`;

                // Parse competenze linguistiche
                let lingueHtml = '';
                try {
                    const lingue = JSON.parse(card.competenze_linguistiche || '[]');
                    lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
                } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

                // Distanza
                const distanzaBadge = card.distanza
                    ? `<div style="margin-top: 0.5rem;"><span style="display: inline-block; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; border: 1px solid rgba(0, 255, 102, 0.2);">${card.distanza}</span></div>`
                    : '';

                const icons = {
                    lingue: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
                    competenze: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
                    esperienza: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
                    luogo: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
                    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
                    email: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
                    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
                    github: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
                };

                const formattedLingue = lingueHtml.split(',').map(l => `<div style="margin-bottom:0.1rem;">${l.trim()}</div>`).join('');

                const html = `
                <div class="glass-panel devcard devcard-layout" style="padding: 1.5rem; transition: all 0.3s ease;">
                    <div class="card-header-top">
                        <div class="avatar-container">
                            ${avatarHtml}
                        </div>
                        <div class="name-stack">
                            <h3 style="font-size: 1.4rem;">${card.nome} ${card.cognome}</h3>
                            <span class="age-label" style="font-size: 0.8rem; margin-bottom: 0.4rem;">${card.eta || '?'} ANNI</span>
                            <div class="tech-tags-row">
                                ${langSpans}
                            </div>
                        </div>
                    </div>

                    <div class="card-grid-main" style="gap: 1rem; padding-top: 0.8rem; margin-top: -0.5rem;">
                        <div class="lingue-col">
                            <h4 class="section-label-new" style="font-size: 0.7rem;">${icons.lingue} LINGUE</h4>
                            <div class="list-content" style="font-size: 0.85rem;">${formattedLingue}</div>
                        </div>
                        <div class="esper-col">
                            <h4 class="section-label-new" style="font-size: 0.7rem;">${icons.esperienza} EXP</h4>
                            <div class="list-content" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">
                                ${card.anni_esperienza} ANNI
                            </div>
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--card-border); padding-top: 0.8rem;">
                        <h4 class="section-label-new" style="font-size: 0.7rem;">${icons.competenze} COMPETENZE</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${card.competenze || 'Non specificate'}</p>
                    </div>

                    <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 1rem; line-height: 1.4; font-style: italic;">
                        ${card.bio || 'Nessuna biografia inserita.'}
                    </p>

                    <div style="display: flex; gap: 0.8rem; margin-top: 1rem;">
                        <button class="btn btn-interview" data-id="${card.id}" data-name="${card.nome} ${card.cognome}" style="flex: 3; padding: 0.8rem; font-size: 0.9rem; font-weight: 700;">💼 Proponi Colloquio</button>
                        <button class="btn-remove" data-id="${card.id}" style="flex: 1; padding: 0.8rem; border-radius: 12px; background: rgba(255, 75, 75, 0.1); border: 1px solid #ff4b4b; color: #ff4b4b; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">❌ Elimina</button>
                    </div>

                    <div class="card-footer-social" style="margin-top: 0.8rem; padding-top: 0.6rem;">
                        <div class="social-icons-group" style="gap: 0.5rem;">
                            <div class="social-icon" style="width:24px; height:24px;" onclick="event.stopPropagation(); alert('Telefono: ${card.telefono || 'N/D'}')">${icons.phone}</div>
                            <div class="social-icon" style="width:24px; height:24px;" onclick="event.stopPropagation(); alert('Email: ${card.email || 'N/D'}')">${icons.email}</div>
                            <div class="social-icon" style="width:24px; height:24px;" onclick="event.stopPropagation(); alert('LinkedIn: ${card.linkedin || 'N/D'}')">${icons.linkedin}</div>
                            <div class="social-icon" style="width:24px; height:24px;" onclick="event.stopPropagation(); alert('GitHub: ${card.github || 'N/D'}')">${icons.github}</div>
                        </div>
                    </div>
                </div>
                `;
                container.innerHTML += html;
            });

            // Funzionalità Rimuovi dai Preferiti
            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', async function () {
                    if (!confirm("Rimuovere questo candidato dai preferiti?")) return;
                    const candidate_id = this.dataset.id;
                    try {
                        const res = await fetch('/api/interact', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ employer_id: user.id, candidate_id })
                        });
                        if (res.ok) {
                            loadDevCards(); // Ricarico la lista
                        } else {
                            alert("Errore durante la rimozione.");
                        }
                    } catch (err) {
                        alert("Errore di connessione.");
                    }
                });
            });

            // Adesso aggiungo la funzionalità ai bottoni "Proponi Colloquio"
            // Devo farlo qui e non all'inizio perché i bottoni sono appena stati creati da javascript!
            document.querySelectorAll('.btn-interview').forEach(btn => {
                btn.addEventListener('click', function () {
                    // Quando clicco, apro il form nascondendo/mostrando delle cose e metto l'id giusto del candidato
                    document.getElementById('interviewCandidateId').value = this.dataset.id;
                    document.getElementById('interviewCandidateName').textContent = this.dataset.name;
                    document.getElementById('interviewResult').innerHTML = ''; // Pulisco messaggi vecchi
                    document.getElementById('interviewForm').reset(); // Azzero i testi del form
                    document.getElementById('interviewModal').classList.add('active'); // Faccio apparire il popup (modale)
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
        const luogo_colloquio = document.getElementById('ivLuogoColloquio').value;
        const data_colloquio = document.getElementById('ivData').value;
        const ora_colloquio = document.getElementById('ivOra').value;
        const resultEl = document.getElementById('interviewResult');

        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employer_id: user.id,
                    candidate_id,
                    posizione_cercata,
                    linguaggi_richiesti,
                    range_stipendio,
                    luogo,
                    data_colloquio,
                    ora_colloquio,
                    luogo_colloquio
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
