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
            // Decodificamos entidades HTML (ej. &Iacute;)
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

    logDiv.innerText = `⏳ Consultando sorteo (${idSorteo}) para el número ${numero} a través de ScraperAPI...`;

    try {
        const targetUrl = `https://www.loteriasyapuestas.es/servicios/buscadordecimos?number=${numero}&drawId=${idSorteo}`;
        const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&country_code=es&url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(scraperUrl);
        
        // Obtenemos la respuesta en texto plano para poder diagnosticar errores HTML (como el 404)
        const textoRespuesta = await response.text();

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${textoRespuesta.substring(0, 150)}`);
        }

        // Intentamos parsear la respuesta como JSON
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

        if (data.puntosDeVenta && data.puntosDeVenta.length > 0) {
            data.puntosDeVenta.forEach((pv, index) => {
                contenidoTxt += `${index + 1}. ${pv.nombre || 'Administración'} - ${pv.direccion}, ${pv.localidad} (${pv.provincia})\n`;
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
        logDiv.innerText = `❌ Error detallado: ${error.message}`;
    }
}

