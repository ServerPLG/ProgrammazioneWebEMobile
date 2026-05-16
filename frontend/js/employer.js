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
            const res = await fetch(`/api/devcards?employer_id=${user.id}`);
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
            ? `<img src="${card.foto_profilo}" alt="Foto" crossorigin="anonymous">`
            : `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0" alt="Avatar">`;

        // Parse competenze linguistiche
        let lingueHtml = '';
        try {
            const lingue = JSON.parse(card.competenze_linguistiche || '[]');
            lingueHtml = lingue.map(l => `${l.lingua} (${l.livello})`).join(', ');
        } catch { lingueHtml = card.competenze_linguistiche || 'Non specificate'; }

        // Distanza
        const distanzaHtml = card.distanza 
            ? `<div style="margin-top: 0.5rem; text-align: center;"><span style="display: inline-block; background: rgba(0, 255, 102, 0.1); color: var(--primary-color); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.85rem; border: 1px solid rgba(0, 255, 102, 0.2);">${card.distanza}</span></div>`
            : '';

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
        <div class="glass-panel devcard devcard-layout" id="currentCard" style="animation: slideUp 0.4s ease-out; padding: 2rem;">
            
            <!-- Header: Avatar + Nome + Age + Tech -->
            <div class="card-header-top">
                <div class="avatar-container" style="position: relative;">
                    ${avatarHtml}
                    ${distanzaHtml}
                </div>
                <div class="name-stack">
                    <h3>${card.nome} ${card.cognome}</h3>
                    <span class="age-label">${card.eta || '?'} ANNI</span>
                    <div class="tech-tags-row">
                        ${langSpans}
                    </div>
                </div>
            </div>

            <!-- Griglia Principale: Lingue e Competenze -->
            <div class="card-grid-main">
                <div class="lingue-col">
                    <h4 class="section-label-new">${icons.lingue} LINGUE</h4>
                    <div class="list-content">${formattedLingue}</div>
                </div>
                <div class="competenze-col full-width-section">
                    <h4 class="section-label-new">${icons.competenze} COMPETENZE</h4>
                    <div class="list-content">${card.competenze || 'Non specificate'}</div>
                </div>
            </div>

            <!-- Row: Esperienza e Luogo -->
            <div class="card-grid-main" style="border-top: none; padding-top: 0;">
                <div class="esper-col">
                    <h4 class="section-label-new">${icons.esperienza} ESPERIENZA</h4>
                    <div class="list-content" style="font-weight: 700; text-transform: uppercase;">
                        ${card.anni_esperienza} ANNI
                        <div style="font-weight: 400; font-size: 0.85rem; margin-top: 0.2rem;">Developer</div>
                    </div>
                </div>
                <div class="luogo-col">
                    <h4 class="section-label-new">${icons.luogo} LUOGO</h4>
                    <div class="list-content" style="font-weight: 700; text-transform: uppercase;">
                        ${card.citta || 'N/D'}
                    </div>
                </div>
            </div>

            <!-- Biografia -->
            <div class="full-width-section">
                <h4 class="section-label-new">${icons.biografia} BIOGRAFIA</h4>
                <div class="list-content" style="font-style: italic; color: var(--text-muted); line-height: 1.4;">
                    ${card.bio || 'Nessuna biografia inserita.'}
                </div>
            </div>

            <!-- Footer Social (Nascosto per Datore nel Feed, ma mostro il segnaposto) -->
            <div class="card-footer-social">
                <div class="social-icons-group">
                    <div class="social-icon" onclick="event.stopPropagation(); alert('Salva il profilo per sbloccare i contatti!')">${icons.phone}</div>
                    <div class="social-icon" onclick="event.stopPropagation(); alert('Salva il profilo per sbloccare i contatti!')">${icons.email}</div>
                    <div class="social-icon" onclick="event.stopPropagation(); alert('Salva il profilo per sbloccare i contatti!')">${icons.linkedin}</div>
                    <div class="social-icon" onclick="event.stopPropagation(); alert('Salva il profilo per sbloccare i contatti!')">${icons.github}</div>
                </div>
                <div class="designed-tag">DESIGNED BY DEVCARDS</div>
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

        fetch('/api/interact', {
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

    // =============================
    // Cambio Password
    // =============================
    document.getElementById('btnChangePassword').addEventListener('click', () => {
        document.getElementById('changePasswordModal').classList.add('active');
        document.getElementById('pwdResult').innerHTML = '';
        document.getElementById('changePasswordForm').reset();
    });

    document.getElementById('closePwdModal').addEventListener('click', () => {
        document.getElementById('changePasswordModal').classList.remove('active');
    });

    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const resultEl = document.getElementById('pwdResult');

        if (newPassword !== confirmPassword) {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">✗ Le due password non coincidono</span>';
            return;
        }

        try {
            const res = await fetch('/api/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                resultEl.innerHTML = `<span style="color: var(--primary-color);">✓ ${data.message}</span>`;
                document.getElementById('changePasswordForm').reset();
            } else {
                resultEl.innerHTML = `<span style="color: #ff4b4b;">✗ ${data.error}</span>`;
            }
        } catch (err) {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">Errore di connessione al server.</span>';
        }
    });

    loadDevCards();
});
