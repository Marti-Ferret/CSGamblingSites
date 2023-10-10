window.addEventListener('load', loadCsvKeyDrop);

const boxes = {};

function loadCsvKeyDrop() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'Files/KeyDropV2.csv', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const csvData = xhr.responseText;
            processData(csvData);
        }
    };
    xhr.send();
}

function processData(csvData) {
    const lines = csvData.split('\n');

    let currentBox = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('"')) {
            currentBox = parseBox(line);
            boxes[currentBox.name] = currentBox;
        } else if (line.startsWith('iProbabilidad')) {
            continue;
        } else if (currentBox) {
            const item = parseItem(line);
            currentBox.items.push(item);
        }
    }

    transformBoxData();
    transformItemData();

    //console.log(boxes);
}

function parseBox(line) {
    const parts = line.split('","');
    const idAndName = parts[0].trim();
    const priceAndURL = parts[1].trim();
    const name = parts[2].trim();
    const id = idAndName.match(/[0-9]+/)[0];
    return {
        name: name,
        price: priceAndURL,
        items: []
    };
}

function transformBoxData() {
    for (const boxName in boxes) {
        if (boxes.hasOwnProperty(boxName)) {
            const box = boxes[boxName];

            const nameParts = box.name.split('US$');
            const name = nameParts[1];
            const price = nameParts[0].trim();

            if (name.startsWith("Nuevo")) {
                box.name = name.substring(5);
            } else {
                box.name = name;
            }
            if (price.startsWith("Nuevo")) {
                box.price = price.substring(5) + ' US$';
            } else {
                box.price = price + ' US$';
            }
        }
    }
}

function transformItemData() {
    for (const boxName in boxes) {
        if (boxes.hasOwnProperty(boxName)) {
            const box = boxes[boxName];

            for (let i = 0; i < box.items.length; i++) {
                const item = box.items[i];

                const parts = item.probability.split('%');
                const probability = parts[0].trim();

                const tempName = item.name;
                item.name = item.price;
                item.price = tempName;

                item.probability = probability + '%';

                item.name = item.name.replace("Probabilidad", "").trim();
            }
        }
    }
}
function parseItem(line) {
    const parts = line.split('US$');
    const price = parts[parts.length - 1].trim();

    const nameMatch = parts[0].match(/([\d,.]+%)(.+)/);

    if (nameMatch) {
        const probability = nameMatch[1].trim();
        const name = nameMatch[2].trim();

        return {
            probability: probability,
            price: price,
            name: name
        };
    } else {
        return {
            probability: '',
            price: price,
            name: ''
        };
    }
}

