const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../src/models/Product');

const productos = [
  {
    nombre: 'Grato Gesha',
    descripcion: 'Café de especialidad con notas florales y a jazmín.',
    clasificacion: 'Grano Entero',
    precio: 5000,
    gramaje: '500g',
    stock: 10,
    imagen: '/uploads/1792462111246-526762595.png'
  },
  {
    nombre: 'Terra Blend',
    descripcion: 'Blend de la casa, dulce y balanceado, con notas a chocolate.',
    clasificacion: 'Molido',
    precio: 3200,
    gramaje: '250g',
    stock: 15,
    imagen: '/uploads/1792462280293-613655372.jpg'
  },
  {
    nombre: 'Colombia Huila',
    descripcion: 'Origen único de Huila, con acidez brillante y notas frutales.',
    clasificacion: 'Grano Entero',
    precio: 7800,
    gramaje: '1kg',
    stock: 8,
    imagen: '/uploads/1792504014969-638328940.png'
  },
  {
    nombre: 'Brasil Cerrado',
    descripcion: 'Café brasileño de cuerpo cremoso, notas a nuez y caramelo.',
    clasificacion: 'Molido',
    precio: 2900,
    gramaje: '500g',
    stock: 12,
    imagen: '/uploads/1792504059785-984760356.png'
  },
  {
    nombre: 'Etiopía Yirgacheffe',
    descripcion: 'Lavado etíope con notas cítricas y a té negro.',
    clasificacion: 'Grano Entero',
    precio: 4200,
    gramaje: '250g',
    stock: 5,
    imagen: '/uploads/1792505053138-840725605.jpeg'
  }
];

const sembrar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existentes = await Product.countDocuments();
    if (existentes > 0) {
      console.log(`Ya hay ${existentes} productos en la base. No se sembró nada.`);
      return;
    }

    await Product.insertMany(productos);
    console.log(`Se insertaron ${productos.length} productos de ejemplo.`);
  } catch (error) {
    console.error('Error al sembrar productos:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

sembrar();
