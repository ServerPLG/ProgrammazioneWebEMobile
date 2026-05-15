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

                cardSection.innerHTML = `
                    <div class="scene">
                        <div class="devcard-wrapper" id="devcardFlip">
                            <div class="card-glow"></div>
                            <!-- FRONTE -->
                            <div class="devcard-face devcard-front glass-panel devcard" style="padding: 2.2rem; position: relative;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                    <img src="${avatarSrc}" alt="Avatar" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); box-shadow: 0 0 20px rgba(0,255,102,0.15);">
                                    <div>
                                        <h3 style="color: var(--text-main); font-size: 1.8rem; margin: 0;">${card.nome} ${card.cognome}</h3>
                                        <p style="color: var(--text-muted); margin: 0.2rem 0 0;">📍 ${card.citta} · ${card.eta || '?'} anni · ${card.anni_esperienza} anni di esperienza</p>
                                    </div>
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.5rem;">${langSpans}</div>
                                <div style="margin-bottom: 1rem;">
                                    <h4 class="devcard-section-label">Competenze</h4>
                                    <p style="color: var(--text-main); margin: 0;">${card.competenze || 'Non specificate'}</p>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <h4 class="devcard-section-label">Lingue</h4>
                                    <p style="color: var(--text-main); margin: 0;">${lingueHtml}</p>
                                </div>
                                <div>
                                    <h4 class="devcard-section-label">Biografia</h4>
                                    <p style="color: #ccc; line-height: 1.5; margin: 0;">${card.bio}</p>
                                </div>
                                ${card.disponibile_ovunque ? '<div style="margin-top: 1rem;"><span class="lang-tag">🌍 Disponibile Ovunque</span></div>' : ''}
                                <div style="margin-top: auto; padding-top: 1rem; text-align: center;">
                                    <p style="color: var(--text-muted); font-size: 0.85rem; opacity: 0.7;">🔄 Clicca per girare</p>
                                </div>
                            </div>
                            <!-- RETRO -->
                            <div class="devcard-face devcard-back">
                                <div>
                                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1.8rem;">La tua DevCard</h3>
                                    <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem;">Falla inquadrare per condividere il profilo</p>
                                </div>
                                <div style="background: white; padding: 1.6rem; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;">
                                    <div id="qrcode"></div>
                                </div>
                                <div style="margin-top: auto;">
                                    <p style="color: var(--text-muted); font-size: 0.9rem; opacity: 0.8;">🔄 Clicca per tornare al fronte</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="candidate.html" class="edit-btn">✏️ Modifica CV</a>
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
