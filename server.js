
const express = require('express');
const translate = require('node-google-translate-skidz');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app= express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'./public')));

app.post('/compra', (req, res) => {
  const compra = req.body; 

  let compras = [];
  try {
    const fileData = fs.readFileSync('./public/compras.json');
    jsonData = JSON.parse(fileData);
  } catch (err) {
    console.error('Error al leer el archivo JSON:', err);
  }

  compras.push(compra);

  fs.writeFile('./public/compras.json', JSON.stringify(compras, null, 2), err => {
    if (err) {
      res.send('Error interno del servidor');
    } else {
      res.send('Datos escritos correctamente');
    }
  });
});


app.get('/descuentos', async (req, res) => {
  try {
   
    res.sendFile((path.join(__dirname,'./descuentos.json')));
  } catch (error) {
    console.error('Error al obtener descuentos:', error);
  }
});


app.post('/traducir', async(req, res) => {
    const title= req.body.title;
    const description=req.body.description;
    try{
        const translatedTitle = await translate({text:title,source: 'en', target:'es'});
         const translatedDescription = await translate({text:description, source:'en', target:'es'});

    res.json({ title: translatedTitle.translation, description: translatedDescription.translation });
    }catch (error) {
        console.error('Error al traducir:', error);
      }
   
});


app.get('/productos', async (req, res) => {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  });


app.listen(3000,()=>{
    console.log(`servidor iniciado en puerto 3000`)
})