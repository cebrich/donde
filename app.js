// Al cargar la página, recuperamos la API Key guardada de forma privada en el navegador si existe
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('scraper_api_key');
    if (savedKey) {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = savedKey;
        }
    }
});

function guardarApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    const logDiv = document.getElementById('log');
    if (key) {
        localStorage.setItem('scraper_api_key', key);
        if (logDiv) {
            logDiv.innerText = "🔑 API Key guardada de forma segura en tu navegador.";
        }
    }
}

function cargarSorteosDesdeTexto() {
    const htmlCrudo = document.getElementById('jsonInput').value.trim();
    const selectSorteo = document.getElementById('sorteoSelect');
    const logDiv = document.getElementById('log');

    if (!htmlCrudo) {
        logDiv.innerText = "⚠️ Por favor, pega el código HTML del select en el cuadro superior.";
        return;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCrudo, 'text/html');
        const options = doc.querySelectorAll('option');

        selectSorteo.innerHTML = ""; 
        let contador = 0;

        options.forEach(opt => {
            const val = opt.getAttribute('value');
            // Decodificamos entidades HTML por si vienen caracteres especiales (como &Iacute;)
            const txtArea = document.createElement('textarea');
            txtArea.innerHTML = opt.textContent;
            const texto = txtArea.value.trim();

            if (val && val !==

