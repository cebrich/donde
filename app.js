function cargarSorteosDesdeTexto() {
    const htmlCrudo = document.getElementById('jsonInput').value.trim();
    const selectSorteo = document.getElementById('sorteoSelect');
    const logDiv = document.getElementById('log');

    if (!htmlCrudo) {
        alert("Por favor, pega el código HTML del select en el cuadro superior.");
        return;
    }

    try {
        // Creamos un elemento temporal en memoria para leer el HTML pegado
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCrudo, 'text/html');
        
        // Buscamos todas las etiquetas <option> dentro del texto pegado
        const options = doc.querySelectorAll('option');

        selectSorteo.innerHTML = ""; // Limpiar el selector actual
        let contador = 0;

        options.forEach(opt => {
            const val = opt.getAttribute('value');
            const texto = opt.textContent.trim();

            // Ignoramos la opción por defecto que indica "Selecciona..."
            if (val && val !== "NONE") {
                let option = document.createElement('option');
                option.value = val;
                option.text = texto;
                selectSorteo.appendChild(option);
                contador++;
            }
        });

        if (contador > 0) {
            logDiv.innerText = `¡Sorteos cargados con éxito! Se han detectado ${contador} sorteos listos para buscar.`;
        } else {
            selectSorteo.innerHTML = '<option value="">No se encontraron sorteos válidos</option>';
            logDiv.innerText = "El HTML pegado no contiene opciones de sorteo válidas.";
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Error al procesar el código HTML. Asegúrate de haber copiado el bloque <select>...</select> completo.";
    }
}

async function descargarTxtPuntosDeVenta() {
    const idSorteo = document.getElementById('sorteoSelect').value;
    const numero = document.getElementById('numeroInput').value.trim();
    const logDiv = document.getElementById('log');

    if (!idSorteo || idSorteo === "NONE") {
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

