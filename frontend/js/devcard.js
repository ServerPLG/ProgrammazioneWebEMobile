(function () {
    const CARD_LANGUAGE_LIMIT = 6;

    const icons = {
        phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.7 2.8a2 2 0 0 1-.45 2.12L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.12-.45c.9.35 1.84.57 2.8.7A2 2 0 0 1 22 16.92z"/></svg>`,
        email: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
        github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.2-6-3m12 5v-3.5a3 3 0 0 0-.8-2.3c2.8-.3 5.8-1.4 5.8-6.3a4.9 4.9 0 0 0-1.3-3.4 4.5 4.5 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12.2 12.2 0 0 0-6.2 0C6.5 1.9 5.4 2.2 5.4 2.2a4.5 4.5 0 0 0-.1 3.3A4.9 4.9 0 0 0 4 8.9c0 4.9 3 6 5.8 6.3a3 3 0 0 0-.8 2.3V21"/></svg>`
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function splitCsv(value) {
        return String(value || "")
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }

    function getCandidateName(card) {
        return `${card?.nome || ""} ${card?.cognome || ""}`.trim() || "Candidato";
    }

    function getAvatar(card) {
        if (card?.foto_profilo) return card.foto_profilo;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(getCandidateName(card))}&backgroundColor=e2e8f0`;
    }

    function parseSpokenLanguages(raw) {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter(item => item && (item.lingua || item.livello))
                    .map(item => `${item.lingua || "Lingua"}${item.livello ? ` (${item.livello})` : ""}`);
            }
        } catch {
            // Fallback below for old plain-text data.
        }
        return splitCsv(raw);
    }

    function renderTags(items, className = "dc-tag") {
        if (!items.length) return `<span class="${className} is-empty">Non specificati</span>`;
        return items.map(item => `<span class="${className}">${escapeHtml(item)}</span>`).join("");
    }

    function renderContactIcons(card, mode = "full") {
        const locked = mode === "locked";
        const contacts = [
            ["Telefono", locked ? "Salva il profilo per sbloccare i contatti" : card?.telefono, icons.phone],
            ["Email", locked ? "Salva il profilo per sbloccare i contatti" : card?.email, icons.email],
            ["LinkedIn", locked ? "Salva il profilo per sbloccare i contatti" : card?.linkedin, icons.linkedin],
            ["GitHub", locked ? "Salva il profilo per sbloccare i contatti" : card?.github, icons.github]
        ];

        return contacts.map(([label, value, icon]) => `
            <button type="button" class="dc-social-icon" data-dc-contact-label="${escapeAttr(label)}" data-dc-contact-value="${escapeAttr(value || "N/D")}" aria-label="${escapeAttr(label)}">
                ${icon}
            </button>
        `).join("");
    }

    function renderCompactFront(card, options = {}) {
        const programmingLanguages = splitCsv(card?.linguaggi);
        const visibleLanguages = programmingLanguages.slice(0, CARD_LANGUAGE_LIMIT);
        const spokenLanguages = parseSpokenLanguages(card?.competenze_linguistiche);
        const distance = options.showDistance && card?.distanza ? `<span class="dc-distance">${escapeHtml(card.distanza)}</span>` : "";
        const city = card?.citta || card?.luogo_preferito || "N/D";

        return `
            <article class="dc-card-face dc-card-front dc-compact-card" ${options.cardId ? `id="${escapeAttr(options.cardId)}"` : ""}>
                <div class="dc-card-top">
                    <div class="dc-avatar-wrap">
                        <img class="dc-avatar" src="${escapeAttr(getAvatar(card))}" alt="Foto profilo" crossorigin="anonymous">
                        ${distance}
                    </div>
                    <div class="dc-identity">
                        <h3>${escapeHtml(card?.nome || "Nome")}<br>${escapeHtml(card?.cognome || "Cognome")}</h3>
                        <div class="dc-age">${escapeHtml(card?.eta || "?")} ANNI</div>
                        <div class="dc-location">${escapeHtml(city)}</div>
                    </div>
                </div>

                <div class="dc-tech-tags">
                    ${renderTags(visibleLanguages)}
                </div>

                <section class="dc-section dc-section-competences">
                    <h4>COMPETENZE</h4>
                    <p>${escapeHtml(card?.competenze || "Non specificate")}</p>
                </section>

                <div class="dc-info-grid">
                    <section class="dc-section">
                        <h4>LINGUE</h4>
                        <p>${spokenLanguages.length ? spokenLanguages.map(escapeHtml).join("<br>") : "Non specificate"}</p>
                    </section>
                    <section class="dc-section">
                        <h4>ESPERIENZA</h4>
                        <p><strong>${escapeHtml(card?.anni_esperienza ?? 0)} ANNI</strong><br><span>DEVELOPER</span></p>
                    </section>
                </div>

                <footer class="dc-card-footer">
                    <div class="dc-socials">
                        ${renderContactIcons(card, options.contactMode || "full")}
                    </div>
                    <span>DESIGNED BY DEVCARDS</span>
                </footer>
            </article>
        `;
    }

    function renderCardBack(options = {}) {
        const qrId = options.qrId || "qrcode";
        return `
            <article class="dc-card-face dc-card-back">
                <h3 class="brand-font">DevCards</h3>
                <div class="dc-qr-frame">
                    <div class="dc-qr-code" id="${escapeAttr(qrId)}"></div>
                </div>
                <p>Scansione per scoprire il profilo</p>
            </article>
        `;
    }

    function renderCompactCard(card, options = {}) {
        if (options.includeBack) {
            return `
                <div class="dc-scene ${options.sceneClass || ""}">
                    <div class="dc-flip-card ${options.flipClass || ""}" ${options.wrapperId ? `id="${escapeAttr(options.wrapperId)}"` : ""}>
                        ${renderCompactFront(card, options)}
                        ${renderCardBack(options)}
                    </div>
                </div>
            `;
        }

        return `
            <div class="dc-scene ${options.sceneClass || ""}">
                ${renderCompactFront(card, options)}
            </div>
        `;
    }

    function renderInfoList(items) {
        return items
            .filter(item => item.value !== undefined && item.value !== null && String(item.value).trim() !== "")
            .map(item => `
                <div class="dc-profile-info">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                </div>
            `).join("");
    }

    function renderProfileLink(label, value) {
        if (!value) return "";
        const safeValue = escapeHtml(value);
        const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener">${escapeHtml(label)}: ${safeValue}</a>`;
    }

    function renderFullProfile(card) {
        const programmingLanguages = splitCsv(card?.linguaggi);
        const spokenLanguages = parseSpokenLanguages(card?.competenze_linguistiche);
        const availability = [
            card?.disponibile_ovunque ? "Disponibile ovunque" : "",
            card?.smartworking ? "Smartworking" : "",
            card?.luogo_preferito ? `Preferenza: ${card.luogo_preferito}` : ""
        ].filter(Boolean);

        return `
            <article class="dc-profile-card">
                <header class="dc-profile-header">
                    <img class="dc-profile-avatar" src="${escapeAttr(getAvatar(card))}" alt="Foto profilo" crossorigin="anonymous">
                    <div>
                        <p class="dc-profile-kicker">Profilo completo</p>
                        <h2>${escapeHtml(getCandidateName(card))}</h2>
                        <p>${escapeHtml(card?.eta || "?")} anni - ${escapeHtml(card?.citta || "Citta non specificata")}</p>
                    </div>
                </header>

                <section class="dc-profile-section">
                    <h3>Descrizione</h3>
                    <p>${escapeHtml(card?.bio || "Nessuna descrizione inserita.")}</p>
                </section>

                <section class="dc-profile-section">
                    <h3>Linguaggi</h3>
                    <div class="dc-profile-tags">${renderTags(programmingLanguages, "dc-profile-tag")}</div>
                </section>

                <section class="dc-profile-section">
                    <h3>Competenze</h3>
                    <p>${escapeHtml(card?.competenze || "Non specificate")}</p>
                </section>

                <div class="dc-profile-grid">
                    <section class="dc-profile-section">
                        <h3>Lingue</h3>
                        <p>${spokenLanguages.length ? spokenLanguages.map(escapeHtml).join("<br>") : "Non specificate"}</p>
                    </section>
                    <section class="dc-profile-section">
                        <h3>Dettagli</h3>
                        ${renderInfoList([
                            { label: "Esperienza", value: `${card?.anni_esperienza ?? 0} anni` },
                            { label: "Citta", value: card?.citta },
                            { label: "Distanza", value: card?.distanza },
                            { label: "Disponibilita", value: availability.join(" - ") }
                        ]) || "<p>Non specificati</p>"}
                    </section>
                </div>

                <section class="dc-profile-section">
                    <h3>Contatti</h3>
                    <div class="dc-profile-links">
                        ${renderInfoList([
                            { label: "Telefono", value: card?.telefono },
                            { label: "Email", value: card?.email }
                        ])}
                        ${renderProfileLink("LinkedIn", card?.linkedin)}
                        ${renderProfileLink("GitHub", card?.github)}
                        ${renderProfileLink("Social", card?.instagram)}
                    </div>
                </section>
            </article>
        `;
    }

    async function getPublicProfileUrl(userId) {
        let origin = window.location.origin;
        const hostname = window.location.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            try {
                const res = await fetch('/api/server-ip');
                const data = await res.json();
                if (data && data.ip && data.ip !== 'localhost') {
                    origin = `${window.location.protocol}//${data.ip}:${window.location.port}`;
                }
            } catch (err) {
                console.error("Errore nel recupero dell'IP locale del server:", err);
            }
        }
        return `${origin}/public_profile.html?id=${encodeURIComponent(userId)}`;
    }

    function createQrCode(elementId, url, size = 210) {
        const el = document.getElementById(elementId);
        if (!el || typeof QRCode === "undefined") return;
        el.innerHTML = "";
        new QRCode(el, {
            text: url,
            width: size,
            height: size,
            colorDark: "#2f6b43",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    document.addEventListener("click", event => {
        const btn = event.target.closest("[data-dc-contact-label]");
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();
        alert(`${btn.dataset.dcContactLabel}: ${btn.dataset.dcContactValue || "N/D"}`);
    });

    window.DevCardsUI = {
        CARD_LANGUAGE_LIMIT,
        escapeHtml,
        splitCsv,
        parseSpokenLanguages,
        renderCompactCard,
        renderCompactFront,
        renderCardBack,
        renderFullProfile,
        getPublicProfileUrl,
        createQrCode
    };
})();
