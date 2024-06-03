const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const accessToken = 'pk.eyJ1Ijoid2lsbGl3b25rYSIsImEiOiJjbHdyYnVhMDIwOGd5MmlvZ3lsZnRsbTg0In0.bSSPmW9wZJj0mqVX6z3Wsg';


// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json()); // Para analizar cuerpos de solicitudes JSON

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para agregar una tienda
app.post('/add-store', async (req, res) => {
    const { idf, address, ruta, gasolina, velocidad, kmflota } = req.body;

    try {
        // Geocodificar la dirección utilizando la API de Mapbox
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
            params: {
                access_token: accessToken
            }
        });

        const coordinates = response.data.features[0].geometry.coordinates;
        const store = {
            idf,
            address,
            coordinates,
            ruta,
            gasolina,
            velocidad,
            kmflota
        };

        // Leer el archivo stores.json y agregar la nueva tienda
        const storesPath = path.join(__dirname, 'stores.json');
        let stores = [];

        if (fs.existsSync(storesPath)) {
            stores = JSON.parse(fs.readFileSync(storesPath));
        }

        stores.push(store);
        fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2));

        res.status(200).send('Vehiculo agregada correctamente');
    } catch (error) {
        res.status(500).send('Error al agregar la vehiculo');
    }
});



app.put('/update-store/:idf', async (req, res) => {
    const idf = req.params.idf;
    const { address, ruta, gasolina, velocidad, kmflota } = req.body;
    console.log("Se esta actualizando")

    try {
        // Geocodificar la dirección utilizando la API de Mapbox
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
            params: {
                access_token: accessToken
            }
        });

        const coordinates = response.data.features[0].geometry.coordinates;

        const storesPath = path.join(__dirname, 'stores.json');
        let stores = [];

        if (fs.existsSync(storesPath)) {
            stores = JSON.parse(fs.readFileSync(storesPath));
        }

        // Buscar la tienda por idf y actualizar sus datos
        const storeIndex = stores.findIndex(store => store.idf === idf);
        if (storeIndex !== -1) {
            stores[storeIndex] = {
                idf,
                address,
                coordinates,
                ruta,
                gasolina,
                velocidad,
                kmflota
            };

            fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2));
            res.status(200).send(`FLota ${idf}  actualizada correctamente`);
        } else {
            res.status(404).send('Vehiculo no encontrada');
        }
    } catch (error) {
        res.status(500).send('Error al actualizar la vehiculo');
    }
});







// Ruta para obtener todas las tiendas
app.get('/stores', (req, res) => {
    const storesPath = path.join(__dirname, 'stores.json');
    if (fs.existsSync(storesPath)) {
        const stores = JSON.parse(fs.readFileSync(storesPath));
        res.json(stores);
    } else {
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
