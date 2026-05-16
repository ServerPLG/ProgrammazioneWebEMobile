// Aspetto che la pagina HTML sia caricata prima di fare qualsiasi cosa
document.addEventListener('DOMContentLoaded', async () => {
    // Controllo chi è loggato usando il local storage (una specie di database nel browser)
    const user = JSON.parse(localStorage.getItem('user'));

    // Se non c'è l'utente o se non è un candidato, lo caccio via alla home
    if (!user || user.ruolo !== 'candidato') {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = 'index.html';
        return; // Mi fermo qui
    }

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // =============================
    // 1. Mostra la propria DevCard al centro
    // =============================
    const cardSection = document.getElementById('myCardSection'); // Prendo il div dove andrà la card
    try {
        // Chiedo al mio server i dati del CV dell'utente loggato (uso path relativo)
        const res = await fetch(`/api/cv/${user.id}`);
        if (res.ok) {
            const card = await res.json(); // Trasformo la risposta in un oggetto javascript
            if (card && card.bio) { // Se l'utente ha già inserito una bio...
                const avatarSrc = card.foto_profilo
                    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.nome + card.cognome)}&backgroundColor=e2e8f0`;

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

                cardSection.innerHTML = `
                    <div class="scene">
                        <div class="devcard-wrapper" id="devcardFlip">
                            <div class="card-glow"></div>
                            <!-- FRONTE -->
                            <div class="devcard-face devcard-front glass-panel devcard devcard-layout" style="position: relative;">
                                
                                <!-- Header: Avatar + Nome + Age + Tech -->
                                <div class="card-header-top">
                                    <div class="avatar-container">
                                        <img src="${avatarSrc}" alt="Avatar">
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
                                        ${card.bio}
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

                                <div style="margin-top: 0.5rem; text-align: center;">
                                    <p style="color: var(--text-muted); font-size: 0.8rem; opacity: 0.5;">🔄 Clicca per girare</p>
                                </div>
                            </div>
                            <!-- RETRO -->
                            <div class="devcard-face devcard-back">
                                <div>
                                    <h3 class="brand-font" style="color: var(--primary-color); font-size: 2rem; margin-bottom: 0.5rem; letter-spacing: 4px;">DEVCARDS</h3>
                                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; letter-spacing: 1px;">Inquadra per condividere il profilo</p>
                                </div>
                                <div style="background: white; padding: 1.6rem; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;">
                                    <div id="qrcode"></div>
                                </div>
                                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 1.5rem; letter-spacing: 2px;">WWW.DEVCARDS.COM</p>
                                <div style="margin-top: auto;">
                                    <p style="color: var(--text-muted); font-size: 0.8rem; opacity: 0.5;">🔄 Clicca per tornare al fronte</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="candidate.html" class="edit-btn">✏️ Modifica Profilo</a>
                `;

                // Add flip logic (Originale)
                document.getElementById('devcardFlip').addEventListener('click', function() {
                    this.classList.toggle('is-flipped');
                });

                // Generazione QR Code Dinamico con IP reale del server
                async function generateBetterQR() {
                    try {
                        const ipRes = await fetch('/api/server-ip');
                        const ipData = await ipRes.json();
                        const serverIp = ipData.ip;
                        const port = window.location.port ? `:${window.location.port}` : '';
                        
                        // Costruisco il link usando l'IP del server invece di localhost
                        const qrUrl = `http://${serverIp}${port}/public_card.html?id=${user.id}`;
                        
                        new QRCode(document.getElementById("qrcode"), {
                            text: qrUrl,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } catch (err) {
                        console.error("Errore recupero IP server:", err);
                        // Fallback all'origin corrente
                        new QRCode(document.getElementById("qrcode"), {
                            text: `${window.location.origin}/public_card.html?id=${user.id}`,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    }
                }
                generateBetterQR();
            } else {
                cardSection.innerHTML = `
                    <div class="glass-panel" style="text-align: center; padding: 3rem;">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem;">👋 Benvenuto, ${user.nome}!</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Non hai ancora compilato il tuo CV. Crealo ora per farti scoprire dai datori di lavoro!</p>
                        <a href="candidate.html" class="edit-btn">✏️ Compila il tuo CV</a>
                    </div>
                `;
            }
        }
    } catch (err) {
        console.error(err);
        cardSection.innerHTML = '<p style="color: #ff4b4b; text-align: center;">Errore di connessione.</p>';
    }

    // =============================
    // 2. Carica le offerte di colloquio
    // =============================
    const interviewsContainer = document.getElementById('interviewsContainer'); // Il contenitore per le offerte
    try {
        // Faccio un'altra chiamata al server per prendere le offerte arrivate a me
        const res = await fetch(`http://localhost:3000/api/candidate/interviews?candidate_id=${user.id}`);
        const interviews = await res.json();

        if (interviews.length === 0) {
            interviewsContainer.innerHTML = '<p style="color: var(--text-muted);">Nessuna offerta di colloquio ricevuta al momento. Le aziende interessate al tuo profilo ti contatteranno qui!</p>';
            return;
        }

        interviewsContainer.innerHTML = '';
        interviews.forEach(iv => {
            let statusBadge = '';
            let actionsHtml = '';

            if (iv.status === 'pending') {
                statusBadge = '<span class="status-badge status-pending">⏳ In Attesa</span>';
                actionsHtml = `
                    <div class="interview-actions">
                        <button class="btn-accept" data-id="${iv.id}" data-action="accepted">✓ Accetta</button>
                        <button class="btn-reject" data-id="${iv.id}" data-action="rejected">✗ Rifiuta</button>
                    </div>
                `;
            } else if (iv.status === 'accepted') {
                statusBadge = '<span class="status-badge status-accepted">✓ Accettato</span>';
            } else {
                statusBadge = '<span class="status-badge status-rejected">✗ Rifiutato</span>';
            }

            const html = `
            <div class="interview-card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <h4 class="company-name" data-employer-id="${iv.employer_id}">${iv.nome_azienda || (iv.azienda_nome + ' ' + iv.azienda_cognome)}</h4>
                    ${statusBadge}
                </div>
                <div class="interview-meta">
                    <span>💼 ${iv.posizione_cercata}</span>
                    <span>💰 ${iv.range_stipendio || 'Non specificato'}</span>
                    <span>📍 ${iv.luogo || iv.azienda_citta} ${iv.distanza ? '(' + iv.distanza + ')' : ''}</span>
                    <span style="width: 100%; margin-top: 0.3rem; color: var(--text-muted);">📅 ${iv.data_colloquio ? new Date(iv.data_colloquio).toLocaleDateString('it-IT') : 'Data N/D'} alle 🕒 ${iv.ora_colloquio ? iv.ora_colloquio.substring(0, 5) : 'Ora N/D'}</span>
                    ${iv.luogo_colloquio ? `<span style="width: 100%; margin-top: 0.3rem; color: var(--text-muted);">🏢 Colloquio presso: ${iv.luogo_colloquio}</span>` : ''}
                </div>
                ${iv.linguaggi_richiesti ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0;">Linguaggi: <span style="color: var(--text-main);">${iv.linguaggi_richiesti}</span></p>` : ''}
                ${actionsHtml}
            </div>
            `;
            interviewsContainer.innerHTML += html;
        });

        // Aggiungo gli "ascoltatori" sui bottoni per accettare o rifiutare le offerte
        document.querySelectorAll('.btn-accept, .btn-reject').forEach(btn => {
            btn.addEventListener('click', async function () {
                // Prendo i dati (id e se ho accettato/rifiutato) che avevo nascosto nei "data-" attributi del bottone
                const interviewId = this.dataset.id;
                const status = this.dataset.action;
                try {
                    // Mando la decisione al server con il metodo PUT (che si usa per aggiornare cose)
                    const res = await fetch('http://localhost:3000/api/interview/status', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ interview_id: interviewId, status })
                    });
                    if (res.ok) {
                        location.reload(); // Se va tutto bene ricarico la pagina per vedere i cambiamenti
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        });

        let companyMapInstance = null;

        // Event listeners per click nome azienda (mostra dettaglio)
        document.querySelectorAll('.company-name').forEach(el => {
            el.addEventListener('click', async function () {
                const empId = this.dataset.employerId;
                try {
                    const res = await fetch(`http://localhost:3000/api/employer/${empId}`);
                    const company = await res.json();
                    const modalBody = document.getElementById('companyModalBody');
                    modalBody.innerHTML = `
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem;">${company.nome_azienda || (company.nome + ' ' + company.cognome)}</h3>
                        <p style="color: var(--text-muted); margin-bottom: 0.5rem;">📍 ${company.citta}</p>
                        ${company.lat && company.lon ? '<div id="companyMap" style="height: 200px; width: 100%; border-radius: 12px; margin-top: 1rem; border: 1px solid var(--card-border);"></div>' : ''}
                        <h4 class="devcard-section-label" style="margin-top: 1.5rem;">Descrizione</h4>
                        <p style="color: #ccc; line-height: 1.6;">${company.descrizione_azienda || 'Nessuna descrizione disponibile.'}</p>
                    `;
                    document.getElementById('companyModal').classList.add('active');

                    if (companyMapInstance) {
                        companyMapInstance.remove();
                        companyMapInstance = null;
                    }

                    if (company.lat && company.lon) {
                        // Inizializza la mappa dopo che il modale è visibile
                        setTimeout(() => {
                            companyMapInstance = L.map('companyMap').setView([company.lat, company.lon], 13);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                maxZoom: 19,
                                attribution: '© OpenStreetMap'
                            }).addTo(companyMapInstance);
                            L.marker([company.lat, company.lon]).addTo(companyMapInstance)
                                .bindPopup(company.nome_azienda || company.nome)
                                .openPopup();
                        }, 50);
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        });

    } catch (err) {
        console.error(err);
        interviewsContainer.innerHTML = '<p style="color: #ff4b4b;">Errore nel caricamento delle offerte.</p>';
    }

    // Chiudi modale azienda
    document.getElementById('closeCompanyModal').addEventListener('click', () => {
        document.getElementById('companyModal').classList.remove('active');
    });

    // =============================
    // 3. Cambio Password
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

        // Controllo che le due nuove password coincidano
        if (newPassword !== confirmPassword) {
            resultEl.innerHTML = '<span style="color: #ff4b4b;">✗ Le due password non coincidono</span>';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/change-password', {
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
});
