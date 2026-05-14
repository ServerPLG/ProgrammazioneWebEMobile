document.addEventListener('DOMContentLoaded', () => {
    // Prendo gli elementi dalla pagina HTML usando il loro ID
    // Se cambio ID nell'HTML ricordarsi di cambiarli pure qui sennò si rompe tutto!
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    // Quando clicco su "Registrati", nascondo il login e faccio apparire la registrazione
    showRegisterBtn.addEventListener('click', () => {
        loginPanel.style.display = 'none'; // none vuol dire che scompare
        registerPanel.style.display = 'block'; // block lo fa riapparire
        // Inizializza la mappa solo se è visibile (ruolo candidato)
        const ruolo = document.querySelector('input[name="role"]:checked').value;
        if (ruolo === 'candidato') {
            setTimeout(() => initMap(), 100);
        }
    });

    // Quando clicco su "Accedi", faccio l'inverso
    showLoginBtn.addEventListener('click', () => {
        registerPanel.style.display = 'none';
        loginPanel.style.display = 'block';
    });

    // =============================
    // GESTIONE DEI CAMPI DIVERSI TRA CANDIDATO E DATORE
    // =============================
    // Toggle campi dinamici in base al ruolo scelto
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const candidatoFields = document.getElementById('candidatoFields');

    // Funzione che controlla quale pallino è selezionato e fa apparire i campi giusti
    function updateRoleFields() {
        // Prendo il valore del radio button selezionato in questo momento
        const ruolo = document.querySelector('input[name="role"]:checked').value;
        const mapSection = document.getElementById('mapSection');
        if (ruolo === 'candidato') {
            candidatoFields.style.display = 'block'; // Mostro i campi candidato
            mapSection.style.display = 'block'; // Mostro la mappa
            // Inizializzo la mappa se non è stata ancora creata
            setTimeout(() => initMap(), 100);
        } else {
            candidatoFields.style.display = 'none'; // Nascondo candidato
            mapSection.style.display = 'none'; // Nascondo la mappa (il datore la compilerà dopo)
        }
    }

    // Aggiungo un "ascoltatore" ad ogni radio button, così quando cambia chiamo la funzione
    roleRadios.forEach(radio => radio.addEventListener('change', updateRoleFields));
    // La chiamo subito una volta all'inizio per impostare le cose giuste di base
    updateRoleFields();

    // =============================
    // MAPPA LEAFLET (OpenStreetMap)
    // =============================
    let map = null;
    let marker = null;

    function initMap() {
        if (map) return; // Già inizializzata

        map = L.map('regMap').setView([41.9028, 12.4964], 5); // Centro Italia

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Click sulla mappa per posizionare il marker
        map.on('click', function (e) {
            setMapMarker(e.latlng.lat, e.latlng.lng);
            reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
    }

    function setMapMarker(lat, lng) {
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on('dragend', function () {
                const pos = marker.getLatLng();
                document.getElementById('regLat').value = pos.lat;
                document.getElementById('regLon').value = pos.lng;
                reverseGeocode(pos.lat, pos.lng);
            });
        }
        document.getElementById('regLat').value = lat;
        document.getElementById('regLon').value = lng;
        map.setView([lat, lng], 13);
    }

    async function reverseGeocode(lat, lon) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
                headers: { 'User-Agent': 'DevCards/1.0' }
            });
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '';
            if (city) {
                document.getElementById('regCitta').value = city;
            }
            document.getElementById('mapSelectedLocation').textContent =
                `📍 ${data.display_name || 'Posizione selezionata'}`;
        } catch (err) {
            console.error('Errore reverse geocode:', err);
        }
    }

    // Bottone cerca sulla mappa
    document.getElementById('btnSearchMap').addEventListener('click', async () => {
        const query = document.getElementById('regCitta').value.trim();
        if (!query) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
                headers: { 'User-Agent': 'DevCards/1.0' }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setMapMarker(lat, lon);
                document.getElementById('mapSelectedLocation').textContent =
                    `📍 ${data[0].display_name}`;
            } else {
                document.getElementById('mapSelectedLocation').textContent = '❌ Nessun risultato trovato';
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Toggle foto da file o link
    const btnFotoFile = document.getElementById('btnFotoFile');
    const btnFotoLink = document.getElementById('btnFotoLink');
    const regFoto = document.getElementById('regFoto');
    const regFotoUrl = document.getElementById('regFotoUrl');

    btnFotoFile.addEventListener('click', () => {
        regFoto.style.display = 'block';
        regFotoUrl.style.display = 'none';
        btnFotoFile.style.borderColor = 'var(--primary-color)';
        btnFotoFile.style.color = 'var(--primary-color)';
        btnFotoLink.style.borderColor = 'var(--card-border)';
        btnFotoLink.style.color = 'var(--text-muted)';
    });

    btnFotoLink.addEventListener('click', () => {
        regFoto.style.display = 'none';
        regFotoUrl.style.display = 'block';
        btnFotoLink.style.borderColor = 'var(--primary-color)';
        btnFotoLink.style.color = 'var(--primary-color)';
        btnFotoFile.style.borderColor = 'var(--card-border)';
        btnFotoFile.style.color = 'var(--text-muted)';
    });

    // =============================
    // RECUPERO PASSWORD
    // =============================
    const recoverModal = document.getElementById('recoverModal');
    document.getElementById('showRecoverPassword').addEventListener('click', () => {
        recoverModal.classList.add('active');
    });
    document.getElementById('closeRecoverModal').addEventListener('click', () => {
        recoverModal.classList.remove('active');
    });

    document.getElementById('recoverForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('recoverEmail').value;
        const resultEl = document.getElementById('recoverResult');
        try {
            const res = await fetch('http://localhost:3000/api/recover-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                resultEl.innerHTML = `<span style="color: var(--primary-color);">✓ ${data.message}</span>`;
            } else {
                resultEl.innerHTML = `<span style="color: #ff4b4b;">✗ ${data.error}</span>`;
            }
        } catch (err) {
            resultEl.innerHTML = `<span style="color: #ff4b4b;">Errore di connessione.</span>`;
        }
    });

    // =============================
    // LOGIN (PARTE IMPORTANTE)
    // =============================
    // Quando premo il tasto invio o clicco il bottone del form di login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Questo serve per NON far ricaricare la pagina (altrimenti perdo i dati)
        
        // Prendo quello che l'utente ha scritto nelle caselle
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Faccio una "chiamata" al server (che sta sulla porta 3000)
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST', // Uso POST per mandare i dati in modo più sicuro
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) // Trasformo in JSON (stringa) i dati
            });
            const data = await response.json(); // Risposta del server

            if (response.ok) { // Se è andato tutto bene (status 200)
                // Salvo l'utente nel local storage così mi ricordo chi è
                // (è tipo un database dentro il browser)
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Lo mando alla pagina giusta a seconda di chi è
                if (data.user.ruolo === 'candidato') {
                    window.location.href = 'candidate_home.html';
                } else {
                    window.location.href = 'employer.html';
                }
            } else {
                // Se la password è sbagliata stampo un alert bruttino
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error); // Stampo l'errore nella console (F12)
            alert("Errore di connessione al server. Il server è acceso?");
        }
    });

    // =============================
    // REGISTRAZIONE
    // =============================
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ruolo = document.querySelector('input[name="role"]:checked').value;
        const nome = document.getElementById('regNome').value;
        const cognome = document.getElementById('regCognome').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        let citta = null;
        let lat = null;
        let lon = null;
        let eta = null;
        let anni_esperienza = 0;
        let max_distanza_km = null;
        let foto_profilo = null;

        if (ruolo === 'candidato') {
            citta = document.getElementById('regCitta').value;
            lat = document.getElementById('regLat').value || null;
            lon = document.getElementById('regLon').value || null;
            eta = document.getElementById('regEta').value || null;
            anni_esperienza = document.getElementById('regExp').value || 0;
            max_distanza_km = document.getElementById('regMaxDistanza').value || null;

            // Check foto da file o da URL
            const regFotoInput = document.getElementById('regFoto');
            const regFotoUrlInput = document.getElementById('regFotoUrl');

            if (regFotoInput.style.display !== 'none' && regFotoInput.files.length > 0) {
                const file = regFotoInput.files[0];
                foto_profilo = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            } else if (regFotoUrlInput.style.display !== 'none' && regFotoUrlInput.value.trim()) {
                foto_profilo = regFotoUrlInput.value.trim();
            }
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruolo, nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, foto_profilo })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Registrazione completata! Ora puoi fare il login.");
                document.getElementById('showLogin').click();
            } else {
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
        }
    });
});
