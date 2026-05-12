document.addEventListener('DOMContentLoaded', () => {
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    showRegisterBtn.addEventListener('click', () => {
        loginPanel.style.display = 'none';
        registerPanel.style.display = 'block';
        // Inizializza la mappa quando il pannello di registrazione diventa visibile
        setTimeout(() => initMap(), 100);
    });

    showLoginBtn.addEventListener('click', () => {
        registerPanel.style.display = 'none';
        loginPanel.style.display = 'block';
    });

    // Toggle campi dinamici in base al ruolo
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const candidatoFields = document.getElementById('candidatoFields');
    const datoreFields = document.getElementById('datoreFields');
    const mapLabel = document.getElementById('mapLabel');

    function updateRoleFields() {
        const ruolo = document.querySelector('input[name="role"]:checked').value;
        if (ruolo === 'candidato') {
            candidatoFields.style.display = 'block';
            datoreFields.style.display = 'none';
            mapLabel.textContent = '📍 Luogo di Residenza';
        } else {
            candidatoFields.style.display = 'none';
            datoreFields.style.display = 'block';
            mapLabel.textContent = '📍 Sede Aziendale';
        }
    }

    roleRadios.forEach(radio => radio.addEventListener('change', updateRoleFields));
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
    // LOGIN
    // =============================
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.ruolo === 'candidato') {
                    window.location.href = 'candidate_home.html';
                } else {
                    window.location.href = 'employer.html';
                }
            } else {
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
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
        const citta = document.getElementById('regCitta').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Coordinate dalla mappa
        const lat = document.getElementById('regLat').value || null;
        const lon = document.getElementById('regLon').value || null;

        let eta = null;
        let anni_esperienza = 0;
        let max_distanza_km = null;
        let foto_profilo = null;
        let descrizione_azienda = null;

        if (ruolo === 'candidato') {
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
        } else {
            descrizione_azienda = document.getElementById('regDescAzienda').value;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruolo, nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, foto_profilo, descrizione_azienda })
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
