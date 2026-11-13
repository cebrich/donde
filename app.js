// Al cargar la página, configuramos eventos y recuperamos la API Key guardada
document.addEventListener('DOMContentLoaded', () => {
    // 1. Recuperar API Key guardada de forma privada
    const savedKey = localStorage.getItem('scraper_api_key');
    if (savedKey) {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = savedKey;
        }
    }

    // 2. Vincular los botones de forma segura
    const btnCargar = document.getElementById('btnCargar');
    if (btnCargar) {
        btnCargar.addEventListener('click', cargarSorteosDesdeTexto);
    }

    const btnGenerar = document.getElementById('btnGenerar');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', descargarTxtPuntosDeVenta);
    }

    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', guardarApiKey);
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
        logDiv.innerText = "⚠️ Por favor, pega el código HTML del select en el cuadro

