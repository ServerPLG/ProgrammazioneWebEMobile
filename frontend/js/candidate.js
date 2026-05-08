document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'candidato') {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('cvForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bio = document.getElementById('cvBio').value;
        const competenze = document.getElementById('cvComp').value;
        const linguaggi = document.getElementById('cvLang').value;
        const telefono = document.getElementById('cvPhone').value;
        const instagram = document.getElementById('cvInsta').value;

        try {
            const res = await fetch('http://localhost:3000/api/cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    bio, competenze, linguaggi, telefono, instagram
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("Il tuo CV è stato aggiornato con successo sulla tua DevCard!");
            } else {
                alert("Errore: " + data.error);
            }
        } catch(error) {
            console.error(error);
            alert("Errore di connessione.");
        }
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
