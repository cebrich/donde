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

    logDiv.innerText = "Consultando puntos de venta a través de ScraperAPI...";

    try {
        // Usamos los parámetros reales descubiertos: number y drawId
        const targetUrl = `https://www.loteriasyapuestas.es/servicios/buscadordecimos?number=${numero}&drawId=${idSorteo}`;
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
        logDiv.innerText = "Error al obtener los datos. Comprueba tu API Key y prueba de nuevo.";
    }
}

