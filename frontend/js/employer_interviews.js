document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.ruolo !== 'datore') {
        alert("Accesso negato. Fai il login come datore di lavoro.");
        window.location.href = 'index.html';
        return;
    }

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    const container = document.getElementById('interviewsContainer');

    try {
        const res = await fetch(`/api/employer/interviews?employer_id=${user.id}`);
        const interviews = await res.json();

        if (interviews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid var(--card-border);">
                    <h3 style="color: var(--text-main); margin-bottom: 1rem;">Nessuna proposta inviata</h3>
                    <p style="color: var(--text-muted);">Non hai ancora proposto alcun colloquio. Vai nei tuoi preferiti per contattare i candidati!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        interviews.forEach(iv => {
            let statusBadge = '';

            if (iv.status === 'pending') {
                statusBadge = '<span class="status-badge status-pending">⏳ In Attesa</span>';
            } else if (iv.status === 'accepted') {
                statusBadge = '<span class="status-badge status-accepted">✓ Accettato</span>';
            } else {
                statusBadge = '<span class="status-badge status-rejected">✗ Rifiutato</span>';
            }

            const avatarSrc = iv.foto_profilo
                || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(iv.candidato_nome + iv.candidato_cognome)}&backgroundColor=e2e8f0`;

            const dataStr = iv.data_colloquio ? new Date(iv.data_colloquio).toLocaleDateString('it-IT') : 'Data N/D';
            const oraStr = iv.ora_colloquio ? iv.ora_colloquio.substring(0, 5) : 'Ora N/D';

            const html = `
            <div class="interview-card">
                <div class="avatar-container">
                    <img src="${avatarSrc}" alt="Avatar Candidato">
                </div>
                <div class="interview-info">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                        <h4 style="margin: 0; color: var(--text-main); font-size: 1.3rem;">${iv.candidato_nome} ${iv.candidato_cognome}</h4>
                        ${statusBadge}
                    </div>
                    
                    <div class="interview-meta" style="margin-top: 0.8rem;">
                        <span>💼 <strong>Posizione:</strong> ${iv.posizione_cercata}</span>
                        <span>📍 <strong>Luogo:</strong> ${iv.luogo || 'Non specificato'}</span>
                        <span style="width: 100%; margin-top: 0.2rem; color: var(--text-muted);">📅 ${dataStr} alle 🕒 ${oraStr}</span>
                        ${iv.luogo_colloquio ? `<span style="width: 100%; margin-top: 0.2rem; color: var(--text-muted);">🏢 <strong>Colloquio presso:</strong> ${iv.luogo_colloquio}</span>` : ''}
                    </div>
                    
                    ${iv.linguaggi_richiesti ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0;">Linguaggi: <span style="color: var(--text-main);">${iv.linguaggi_richiesti}</span></p>` : ''}
                    ${iv.range_stipendio ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0;">Stipendio: <span style="color: var(--text-main);">${iv.range_stipendio}</span></p>` : ''}
                </div>
            </div>
            `;
            container.innerHTML += html;
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color: #ff4b4b;">Errore nel caricamento dei colloqui. Riprova più tardi.</p>';
    }
});
