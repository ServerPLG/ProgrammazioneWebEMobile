document.addEventListener("DOMContentLoaded", () => {
    // Rimuoviamo vecchi sfondi se presenti nel body per evitare duplicati
    const vecchiSfondi = document.querySelectorAll('.bg-waves, .bg-blobs');
    vecchiSfondi.forEach(el => el.remove());

    const bgHTML = `
    <div class="wave-container">
        <!-- Top Right -->
        <div class="organic-blob blob-tr-1"></div>
        <div class="organic-blob blob-tr-2"></div>
        <div class="organic-blob blob-tr-3"></div>

        <!-- Bottom Left -->
        <div class="organic-blob blob-bl-1"></div>
        <div class="organic-blob blob-bl-2"></div>
        <div class="organic-blob blob-bl-3"></div>

        <!-- Thin White Line Curve -->
        <svg class="thin-curve" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,700 C200,600 300,950 500,800 C700,650 700,450 850,550 C1000,650 1000,950 1150,900" />
        </svg>
    </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', bgHTML);
});
