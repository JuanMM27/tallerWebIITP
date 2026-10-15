const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('ecommerce funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});