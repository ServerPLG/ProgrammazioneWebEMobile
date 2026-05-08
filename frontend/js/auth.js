document.addEventListener('DOMContentLoaded', () => {
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    showRegisterBtn.addEventListener('click', () => {
        loginPanel.style.display = 'none';
        registerPanel.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', () => {
        registerPanel.style.display = 'none';
        loginPanel.style.display = 'block';
    });

    // Login API Call
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
                // Salva l'id utente e il ruolo
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Reindirizzamento in base al ruolo
                if (data.user.ruolo === 'candidato') {
                    window.location.href = 'candidate.html';
                } else {
                    window.location.href = 'employer.html';
                }
            } else {
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server. Assicurati che il backend Node.js sia in esecuzione sulla porta 3000.");
        }
    });

    // Register API Call
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ruolo = document.querySelector('input[name="role"]:checked').value;
        const nome = document.getElementById('regNome').value;
        const cognome = document.getElementById('regCognome').value;
        const eta = document.getElementById('regEta').value;
        const citta = document.getElementById('regCitta').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruolo, nome, cognome, eta, citta, email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                alert("Registrazione completata! Ora puoi fare il login.");
                document.getElementById('showLogin').click(); // Torna al login
            } else {
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
        }
    });
});
