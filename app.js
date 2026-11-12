function cargarSorteosDesdeTexto() {
    const textoCrudo = document.getElementById('jsonInput').value.trim();
    const selectSorteo = document.getElementById('sorteoSelect');
    const logDiv = document.getElementById('log');

    if (!textoCrudo) {
        alert("Por favor, pega el texto de los sorteos en el cuadro superior.");
        return;
    }

    try {
        // Intentamos parsear el texto pegado como JSON
        // (Si pegas directamente el array o un objeto que contenga los sorteos)
        let drawsData = JSON.parse(textoCrudo);

        // Si el JSON viene envuelto en un objeto, intentamos adaptarlo
        if (!Array.isArray(drawsData)) {
            // Buscamos la primera propiedad que sea un array dentro del objeto
            drawsData = Object.values(drawsData).find(val => Array.isArray(val)) || [];
        }

        selectSorteo.innerHTML = ""; 

        if (drawsData && drawsData.length > 0) {
            drawsData.forEach(sorteo => {
                let option = document.createElement('option');
                // Soportamos varias nomenclaturas comunes en las APIs de Loterías
                option.value = sorteo.id_sorteo || sorteo.id || sorteo.drawId; 
                let fecha = sorteo.fecha || sorteo.date || 'Sin fecha';
                let nombre = sorteo.nombre || sorteo.game_id || sorteo.name || 'Sorteo';
                
                option.text = `${fecha} - ${nombre}`;
                selectSorteo.appendChild(option);
            });
            logDiv.innerText = `¡Sorteos cargados con éxito! Se han detectado ${drawsData.length} sorteos.`;
        } else {
            selectSorteo.innerHTML = '<option value="">No se encontraron sorteos válidos en el texto</option>';
            logDiv.innerText = "El formato no contiene una lista de sorteos reconocible.";
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Error: El texto pegado no tiene un formato JSON válido. Asegúrate de copiar el contenido correcto.";
    }
}

async function descargarTxtPuntosDeVenta() {
    const idSorteo = document.getElementById('sorteoSelect').value;
    const numero = document.getElementById('numeroInput').value.trim();
    const logDiv = document.getElementById('log');

    if (!idSorteo) {
        alert("Por favor, selecciona un sorteo válido del desplegable.");
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

