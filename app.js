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
                option.value = val;
                option.text = texto;
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
    logDiv.innerText = "🚀 Iniciando proceso...";

    const apiKeyEl = document.getElementById('apiKeyInput');
    const idSorteoEl = document.getElementById('sorteoSelect');
    const numeroEl = document.getElementById('numeroInput');

    if (!apiKeyEl || !idSorteoEl || !numeroEl) {
        logDiv.innerText = "❌ Error: Faltan elementos en el formulario.";
        return;
    }

    const apiKey = apiKeyEl.value.trim();
    const idSorteo = idSorteoEl.value;
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

    // Añadimos el parámetro cantCatchMe con un número aleatorio tal como exige el servlet oficial
    const cantCatchMe = Math.floor(Math.random() * 900) + 100;
    const targetUrl = `https://www.loteriasyapuestas.es/new-geo-web/JsonGenerationServlet/posbydraw.json?drawId=${idSorteo}&number=${numero}&cantCatchMe=${cantCatchMe}`;
    const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&country_code=es&url=${encodeURIComponent(targetUrl)}`;

    logDiv.innerText = `⏳ Consultando servlet oficial...`;

    try {
        const response = await fetch(scraperUrl);
        const textoRespuesta = await response.text();

        // Mostramos el código HTTP exacto en pantalla para diagnóstico si falla
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - Respuesta: ${textoRespuesta.substring(0, 120)}`);
        }

        let data;
        try {
            data = JSON.parse(textoRespuesta);
        } catch (e) {
            throw new Error("El servidor no devolvió un JSON válido: " + textoRespuesta.substring(0, 100));
        }

        logDiv.innerText = "📦 ¡Datos obtenidos con éxito! Generando archivo de texto...";

        let contenidoTxt = `LISTADO DE PUNTOS DE VENTA\n`;
        contenidoTxt += `Número: ${numero} | ID Sorteo: ${idSorteo}\n`;
        contenidoTxt += `==================================================\n\n`;

        // Analizamos las posibles variantes de claves en el JSON del servlet
        const puntos = data.puntosDeVenta || data.puntos || data.listaPuntosDeVenta || (Array.isArray(data) ? data : []);

        if (puntos && puntos.length > 0) {
            puntos.forEach((pv, index) => {
                const nombre = pv.nombre || pv.denominacion || 'Administración';
                const direccion = pv.direccion || pv.calle || '';
                const localidad = pv.localidad || pv.poblacion || '';
                const provincia = pv.provincia || '';
                contenidoTxt += `${index + 1}. ${nombre} - ${direccion}, ${localidad} (${provincia})\n`;
            });
        } else {
            contenidoTxt += "El décimo no está disponible actualmente o no hay puntos de venta iniciales asignados para este número.\n";
        }

        const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `puntos_venta_${numero}_sorteo_${idSorteo}.txt`;
        enlace.click();

        logDiv.innerText = `✅ ¡Listo! Archivo puntos_venta_${numero}_sorteo_${idSorteo}.txt descargado correctamente.`;

    } catch (error) {
        console.error(error);
        logDiv.innerText = `❌ Error: ${error.message}`;
    }
}

