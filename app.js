// Al cargar la página, recuperamos la API Key guardada de forma privada en el navegador si existe
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('scraper_api_key');
    if (savedKey) {
        document.getElementById('apiKeyInput').value = savedKey;
    }
});

function guardarApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
        localStorage.setItem('scraper_api_key', key);
        document.getElementById('log').innerText = "API Key guardada de forma segura en tu navegador.";
    }
}

function cargarSorteosDesdeTexto() {
    const htmlCrudo = document.getElementById('jsonInput').value.trim();
    const selectSorteo = document.getElementById('sorteoSelect');
    const logDiv = document.getElementById('log');

    if (!htmlCrudo) {
        alert("Por favor, pega el código HTML del select en el cuadro superior.");
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
            const texto = opt.textContent.trim();

            if (val && val !== "NONE") {
                let option = document.createElement('option');
                option.value = val;
                option.text = texto;
                selectSorteo.appendChild(option);
                contador++;
            }
        });

        if (contador > 0) {
            logDiv.innerText = `¡Sorteos cargados con éxito! (${contador} sorteos disponibles).`;
        } else {
            selectSorteo.innerHTML = '<option value="NONE">No se encontraron sorteos válidos</option>';
            logDiv.innerText = "El HTML pegado no contiene opciones de sorteo válidas.";
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Error al procesar el código HTML.";
    }
}

async function descargarTxtPuntosDeVenta() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const idSorteo = document.getElementById('sorteoSelect').value;
    const numero = document.getElementById('numeroInput').value.trim();
    const logDiv = document.getElementById('log');

    if (!apiKey) {
        alert("Por favor, introduce tu API Key de ScraperAPI en la caja superior.");
        return;
    }

    if (!idSorteo || idSorteo === "NONE") {
        alert("Por favor, selecciona un sorteo válido del desplegable.");
        return;
    }

    if (!numero || numero.length !== 5) {
        alert("Por favor, introduce un número válido de 5 cifras.");
        return;
    }

    logDiv.innerText = "Consultando puntos de venta a través de ScraperAPI (saltando geolocalización)...";

    try {
        const targetUrl = `https://www.loteriasyapuestas.es/servicios/buscadordecimos?numero=${numero}&sorteo=${idSorteo}`;
        // Petición a ScraperAPI forzando IP de España (country_code=es)
        const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&country_code=es&url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(scraperUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        let contenidoTxt = `LISTADO DE PUNTOS DE VENTA\n`;
        contenidoTxt += `Número: ${numero} | ID Sorteo: ${idSorteo}\n`;
        contenidoTxt += `==================================================\n\n`;

        if (data.puntosDeVenta && data.puntosDeVenta.length > 0) {
            data.puntosDeVenta.forEach((pv, index) => {
                contenidoTxt += `${index + 1}. ${pv.nombre || 'Administración'} - ${pv.direccion}, ${pv.localidad} (${pv.provincia})\n`;
            });
        } else {
            contenidoTxt += "El décimo no está disponible actualmente o no hay puntos de venta iniciales asignados.\n";
        }

        const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `puntos_venta_${numero}_sorteo_${idSorteo}.txt`;
        enlace.click();

        logDiv.innerText = `¡Éxito! Archivo de puntos de venta descargado correctamente.`;

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Error al obtener los datos. Comprueba que tu API Key de ScraperAPI sea correcta y tenga créditos disponibles.";
    }
}

