document.addEventListener('DOMContentLoaded', async () => {
    const selectSorteo = document.getElementById('sorteoSelect');
    const logDiv = document.getElementById('log');

    try {
        logDiv.innerText = "Actualizando lista de sorteos desde la fuente oficial...";
        
        // URL del JSON oficial de sorteos de Loterías y Apuestas
        const urlSorteos = 'https://www.loteriasyapuestas.es/e/s/draws';
        
        // Usamos un proxy CORS público para desarrollo en GitHub Pages
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(urlSorteos);

        const response = await fetch(proxyUrl);
        const drawsData = await response.json();

        selectSorteo.innerHTML = ""; 

        if (drawsData && drawsData.length > 0) {
            drawsData.forEach(sorteo => {
                let option = document.createElement('option');
                option.value = sorteo.id_sorteo || sorteo.id; 
                option.text = `${sorteo.fecha || 'Sin fecha'} - ${sorteo.nombre || sorteo.game_id}`;
                selectSorteo.appendChild(option);
            });
            logDiv.innerText = `¡Sorteos actualizados! Se han cargado ${drawsData.length} sorteos disponibles.`;
        } else {
            selectSorteo.innerHTML = '<option value="">No se encontraron sorteos activos</option>';
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Aviso: No se pudieron cargar los sorteos automáticamente por restricciones de red. Asegúrate de usar un servidor local o proxy.";
        selectSorteo.innerHTML = '<option value="">Error al cargar sorteos</option>';
    }
});

async function descargarTxtPuntosDeVenta() {
    const idSorteo = document.getElementById('sorteoSelect').value;
    const numero = document.getElementById('numeroInput').value.trim();
    const logDiv = document.getElementById('log');

    if (!idSorteo) {
        alert("Por favor, selecciona un sorteo válido.");
        return;
    }

    if (!numero || numero.length !== 5) {
        alert("Por favor, introduce un número válido de 5 cifras.");
        return;
    }

    logDiv.innerText = "Consultando puntos de venta para el décimo...";

    try {
        const urlApi = `https://www.loteriasyapuestas.es/servicios/buscadordecimos?numero=${numero}&sorteo=${idSorteo}`;
        const proxyApiUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(urlApi);

        const response = await fetch(proxyApiUrl);
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
        logDiv.innerText = "Error al obtener los datos de la administración.";
    }
}
