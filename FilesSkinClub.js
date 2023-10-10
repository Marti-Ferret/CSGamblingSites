let skinClubObject = {};
let skinClub = {};
const itemsPorNombre = {};

window.addEventListener('load', loadCsvSkinClub);

function loadCsvSkinClub() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'Files/SkinClub.csv', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const csvContent = xhr.responseText;
            const lines = csvContent.split('\n');
            const csvData = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = line.split(',');
                    csvData.push(values);
                }
            }

            processCsvSkinClubLine(0, csvData);
        } else {
            console.error('Error al cargar el archivo CSV');
        }
    };

    xhr.send();
}


function processCsvSkinClubLine(index, csvData) {
    if (index < csvData.length) {
        const csvLine = csvData[index];
        const components = csvLine.map(value => value.trim());

        const nombre = components[4].replace(/"/g, '');
        const precio = components[5].replace(/"/g, '');
        const probabilidad = components[6];
        const preu = components[7];

        const skinClubObject = {
            webScraperOrder: components[0],
            webScraperStartUrl: components[1],
            cases: components[2],
            casesHref: components[3],
            name: nombre,
            price: precio,
            prob: probabilidad,
            preu: preu,
        };

        delete skinClubObject.cases;
        delete skinClubObject.casesHref;
        delete skinClubObject.webScraperOrder;
        delete skinClubObject.webScraperStartUrl;
        delete skinClubObject.preu;

        if (!itemsPorNombre[nombre]) {

            itemsPorNombre[nombre] = {
                nombre,
                precio,
                items: [],
            };
        }

        itemsPorNombre[nombre].items.push({ nombre, probabilidad, preu });

        processCsvSkinClubLine(index + 1, csvData);
    } else {

        for (const nombre in itemsPorNombre) {
            const caja = itemsPorNombre[nombre];
            if (caja.items.length % 2 !== 0) {
                delete itemsPorNombre[nombre];
            }
        }
        mergeItemsSkinClub();

    }
}
function removeSpacesSkinClub() {
    for (const nombreCaja in itemsPorNombre) {
        const caja = itemsPorNombre[nombreCaja];


        for (const item of caja.items) {
            if (item.nombre) {

            }
            if (item.probabilidad) {
                item.probabilidad = item.probabilidad.slice(0, -3);

            }
            if (item.preu) {
                item.preu = item.preu.slice(3);

            }
        }
    }
    clearBoxesWithNoItemsSkinClub();
    calculateBestCasesSkinClub();
    findMostProfitableBoxes();

}
function clearBoxesWithNoItemsSkinClub() {
    for (const nombreCaja in itemsPorNombre) {
        const caja = itemsPorNombre[nombreCaja];
        const items = caja.items;

        const tieneItemsVacios = items.some(item => !item.probabilidad || !item.preu);

        if (tieneItemsVacios) {

            delete itemsPorNombre[nombreCaja];
        }
    }
}



function mergeItemsSkinClub() {
    for (const nombre in itemsPorNombre) {
        const caja = itemsPorNombre[nombre];
        const items = caja.items;

        const filteredItems = items
            .map(item => ({
                probabilidad: item.probabilidad.replace(/['"-]/g, '').trim(),
                preu: item.preu.replace(/['"-]/g, '').trim(),
            }))
            .filter(item => item.probabilidad !== '' || item.preu !== '');

        const mitad = Math.floor(filteredItems.length / 2);
        const nuevosItems = [];

        for (let i = 0; i < mitad; i++) {
            const item1 = filteredItems[i];
            const item2 = filteredItems[i + mitad];

            const probabilidad1 = item1.probabilidad.replace(/-/g, '');
            const probabilidad2 = item2.probabilidad.replace(/-/g, '');
            const preu1 = item1.preu.replace(/-/g, '');
            const preu2 = item2.preu.replace(/-/g, '');

            const newItem = {
                probabilidad: `${probabilidad1} - ${probabilidad2}`,
                preu: `${preu1} - ${preu2}`,
            };

            nuevosItems.push(newItem);
        }
        caja.items = nuevosItems;
    }

    removeSpacesSkinClub();

}
function calculateBestCasesSkinClub() {
    const probabilidadesRecuperacion = [];

    for (const nombreCaja in itemsPorNombre) {
        const caja = itemsPorNombre[nombreCaja];
        const cajaNombre = caja.nombre;
        const items = caja.items;
        const precioCaja = parseFloat(caja.precio.replace('$', '').trim());
        let probabilidadTotal = 0;

        for (const item of items) {
            if (item.probabilidad && item.preu) {
                const probabilidad = parseFloat(item.probabilidad.replace('%', '').trim());
                const precioItem = parseFloat(item.preu.replace('$', '').trim());

                if (precioItem > precioCaja) {
                    probabilidadTotal += probabilidad / 100;
                }
            }
        }
        probabilidadesRecuperacion.push({
            caja: cajaNombre,
            probabilidad: (probabilidadTotal * 100).toFixed(3), // Expresado como porcentaje con 3 decimales
        });
    }

    const resultadosOrdenados = probabilidadesRecuperacion.sort((a, b) => b.probabilidad - a.probabilidad);

   //console.log(resultadosOrdenados);
   console.log(itemsPorNombre);
}

function findMostProfitableBoxes() {
    const cajasRentables = [];

    for (const nombreCaja in itemsPorNombre) {
        const caja = itemsPorNombre[nombreCaja];
        const cajaNombre = caja.nombre;
        const items = caja.items;
        const precioCaja = parseFloat(caja.precio.replace('$', '').trim());
        let probabilidadTotal = 0;

        for (const item of items) {
            if (item.probabilidad && item.preu) {
                const probabilidad = parseFloat(item.probabilidad.replace('%', '').trim());
                const precioItem = parseFloat(item.preu.replace('$', '').trim());

                if (precioItem > precioCaja) {
                    probabilidadTotal += probabilidad / 100;
                }
            }
        }
        const indiceBeneficio = probabilidadTotal / precioCaja;

        cajasRentables.push({
            caja: cajaNombre,
            indiceBeneficio: indiceBeneficio.toFixed(3),
        });
    }

    const cajasOrdenadas = cajasRentables.sort((a, b) => b.indiceBeneficio - a.indiceBeneficio);

    //console.log(cajasOrdenadas);
}