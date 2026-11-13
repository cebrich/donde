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

async function descargarTxtPuntosDeVenta() {
    const logDiv = document.getElementById('log');
    logDiv.innerText = "🚀 Iniciando descarga directa del servlet oficial...";

    const apiKeyEl = document.getElementById('apiKeyInput');
    const idSorteoEl = document.getElementById('sorteoSelect');
    const numeroEl = document.getElementById('numeroInput');

    if (!apiKeyEl || !idSorteoEl || !numeroEl) {
        logDiv.innerText = "❌ Error: Faltan elementos en el formulario.";
        return;
    }

    const apiKey = apiKeyEl.value.trim();
    const idSorteo = idSorteoEl.value.trim();
    const numero = numeroEl.value.trim();

    if (!apiKey) {
        logDiv.innerText = "⚠️ Falta introducir la API Key de ScraperAPI en la caja superior.";
        return;
    }

    if (!idSorteo || idSorteo === "NONE" || idSorteo === "") {
        logDiv.innerText = "⚠️ Debes cargar los sorteos y seleccionar uno válido del desplegable.";
        return;
    }

    if (!numero || numero.length !== 5) {
        logDiv.innerText = "⚠️ El número de décimo debe tener exactamente 5 cifras.";
        return;
    }

    // URL exacta del servlet de descarga de puntos de venta descubierta en el inspector[span_4](start_span)[span_4](end_span)[span_5](start_span)[span_5](end_span)
    const targetUrl = `https://www.loteriasyapuestas.es/new-geo-web/GetTerminalServlet/Sorteo2026txt.csv?drawId=${encodeURIComponent(idSorteo)}&locale=es`;
    const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&country_code=es&url=${encodeURIComponent(targetUrl)}`;

    logDiv.innerText = `⏳ Solicitando archivo al servidor oficial...`;

    try {
        const response = await fetch(scraperUrl);
        const textoRespuesta = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}. Respuesta: ${textoRespuesta.substring(0, 120)}`);
        }

        // Verificamos que hayamos recibido contenido válido de puntos de venta
        if (!textoRespuesta || textoRespuesta.includes("<!DOCTYPE html>")) {
            throw new Error("El servidor devolvió una página de error en lugar del archivo.");
        }

        logDiv.innerText = "📦 ¡Archivo recibido con éxito! Preparando descarga...";

        // Creamos y disparamos la descarga del archivo de texto/CSV directamente
        const blob = new Blob([textoRespuesta], { type: 'text/plain;charset=utf-8' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `puntos_venta_sorteo_${idSorteo}.txt`;
        enlace.click();

        logDiv.innerText = `✅ ¡Listo! Archivo de puntos de venta descargado correctamente.`;

    } catch (error) {
        console.error(error);
        logDiv.innerText = `❌ Error: ${error.message}`;
    }
}

