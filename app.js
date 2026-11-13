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
            // Decodificamos entidades HTML por si vienen caracteres especiales (como &Iacute;)
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
            logDiv.innerText = `¡Sorteos cargados con éxito! (${contador} sorteos disponibles).`;
        } else {
            selectSorteo.innerHTML = '<option value="NONE">No se encontraron sorteos válidos</option>';
            logDiv.innerText = "El HTML pegado no contiene opciones de sorteo reconocibles.";
        }

    } catch (error) {
        console.error(error);
        logDiv.innerText = "Error al procesar el código HTML. Asegúrate de copiar el bloque completo.";
    }
}

