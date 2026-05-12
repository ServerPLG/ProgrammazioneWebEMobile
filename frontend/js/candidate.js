document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.ruolo !== 'candidato') {
        alert("Accesso negato. Fai il login come candidato.");
        window.location.href = 'index.html';
        return;
    }

    const lingueContainer = document.getElementById('lingueContainer');

    // Helper: crea una riga lingua
    function addLinguaRow(lingua = '', livello = 'B1') {
        const row = document.createElement('div');
        row.className = 'lingua-row';
        row.innerHTML = `
            <input type="text" class="form-control lingua-nome" placeholder="Es. Inglese" value="${lingua}">
            <select class="form-control lingua-livello">
                <option value="A1" ${livello === 'A1' ? 'selected' : ''}>A1</option>
                <option value="A2" ${livello === 'A2' ? 'selected' : ''}>A2</option>
                <option value="B1" ${livello === 'B1' ? 'selected' : ''}>B1</option>
                <option value="B2" ${livello === 'B2' ? 'selected' : ''}>B2</option>
                <option value="C1" ${livello === 'C1' ? 'selected' : ''}>C1</option>
                <option value="C2" ${livello === 'C2' ? 'selected' : ''}>C2</option>
            </select>
            <button type="button" class="remove-lingua" title="Rimuovi">✕</button>
        `;
        row.querySelector('.remove-lingua').addEventListener('click', () => row.remove());
        lingueContainer.appendChild(row);
    }

    document.getElementById('addLingua').addEventListener('click', () => addLinguaRow());

    // Carica dati esistenti
    try {
        const res = await fetch(`http://localhost:3000/api/cv/${user.id}`);
        if (res.ok) {
            const data = await res.json();
            if (data) {
                document.getElementById('cvBio').value = data.bio || '';
                document.getElementById('cvComp').value = data.competenze || '';
                document.getElementById('cvLang').value = data.linguaggi || '';
                document.getElementById('cvPhone').value = data.telefono || '';
                document.getElementById('cvInsta').value = data.instagram || '';
                document.getElementById('cvLuogo').value = data.luogo_preferito || '';
                document.getElementById('cvSmartworking').checked = !!data.smartworking;
                document.getElementById('cvDisponibileOvunque').checked = !!data.disponibile_ovunque;

                // Parse competenze linguistiche (JSON)
                try {
                    const lingue = JSON.parse(data.competenze_linguistiche || '[]');
                    if (Array.isArray(lingue) && lingue.length > 0) {
                        lingue.forEach(l => addLinguaRow(l.lingua, l.livello));
                    } else {
                        addLinguaRow(); // Aggiungi riga vuota di default
                    }
                } catch {
                    addLinguaRow();
                }
            } else {
                addLinguaRow(); // Default
            }
        } else {
            addLinguaRow();
        }
    } catch (error) {
        console.error("Errore nel caricamento del CV esistente:", error);
        addLinguaRow();
    }

    // Submit
    document.getElementById('cvForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const bio = document.getElementById('cvBio').value;
        const competenze = document.getElementById('cvComp').value;
        const linguaggi = document.getElementById('cvLang').value;
        const telefono = document.getElementById('cvPhone').value;
        const instagram = document.getElementById('cvInsta').value;
        const luogo_preferito = document.getElementById('cvLuogo').value;
        const smartworking = document.getElementById('cvSmartworking').checked;
        const disponibile_ovunque = document.getElementById('cvDisponibileOvunque').checked;

        // Raccogli competenze linguistiche come JSON
        const lingueRows = document.querySelectorAll('.lingua-row');
        const lingueArray = [];
        lingueRows.forEach(row => {
            const lingua = row.querySelector('.lingua-nome').value.trim();
            const livello = row.querySelector('.lingua-livello').value;
            if (lingua) lingueArray.push({ lingua, livello });
        });
        const competenze_linguistiche = JSON.stringify(lingueArray);

        try {
            const res = await fetch('http://localhost:3000/api/cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    bio, competenze, linguaggi, telefono, instagram,
                    luogo_preferito, disponibile_ovunque,
                    competenze_linguistiche, smartworking
                })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Il tuo CV è stato aggiornato con successo sulla tua DevCard!");
                window.location.href = 'candidate_home.html';
            } else {
                alert("Errore: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione.");
        }
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
