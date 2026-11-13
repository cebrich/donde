// Al cargar la página, configuramos eventos y recuperamos la API Key guardada
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('scraper_api_key');
    if (savedKey) {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = savedKey;
        }
    }

    const btnCargar = document.getElementById('btnCargar');
    if (btnCargar) {
        btnCargar.addEventListener('click', cargarSorteosDesdeTexto);
    }

    const btnGenerar = document.getElementById('btnGenerar');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarEnlaceDescarga);
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
            const txtArea = document.createElement('textarea');
            txtArea.innerHTML = opt.textContent;
            const texto = txtArea.value.trim();

            if (val && val !== "NONE" && val !== "") {
                let option = document.createElement('option');
                option.value = val.trim();
                option.text = `${texto} [ID: ${val.trim()}]`;
                selectSorteo.appendChild(option);
                contador++;
            }
        });

        if (contador > 0) {
            logDiv.innerText = `✅ ¡Sorteos cargados con éxito! (${contador} sorteos disponibles).`;
        } else {
            selectSorteo.innerHTML = '<option value="NONE">No se encontraron sorteos válidos</option>';
            logDiv.innerText = "⚠️ El HTML pegado no contiene opciones de sorteo reconocibles.";
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "❌ Error al procesar el código HTML. Asegúrate de copiar el bloque completo.";
    }
}

function generarEnlaceDescarga() {
    const logDiv = document.getElementById('log');
    const idSorteoEl = document.getElementById('sorteoSelect');

    if (!idSorteoEl) {
        logDiv.innerText = "❌ Error: Faltan elementos en el formulario.";
        return;
    }

    const idSorteo = idSorteoEl.value.trim();

    if (!idSorteo || idSorteo === "NONE" || idSorteo === "") {
        logDiv.innerText = "⚠️ Debes cargar los sorteos y seleccionar uno válido del desplegable.";
        return;
    }

    // Construimos la URL exacta del servlet de puntos de venta descubierta en las capturas de red[span_0](start_span)[span_0](end_span)[span_1](start_span)[span_1](end_span)
    const urlDirecta = `https://www.loteriasyapuestas.es/new-geo-web/GetTerminalServlet/Sorteo2026txt.csv?drawId=${encodeURIComponent(idSorteo)}&locale=es`;

    logDiv.innerHTML = `✅ ¡Enlace generado con éxito!<br><br>👉 <a href="${urlDirecta}" target="_blank" style="color: #0056b3; font-weight: bold; text-decoration: underline;">Haz clic aquí para descargar el archivo oficial de puntos de venta</a>`;
}

