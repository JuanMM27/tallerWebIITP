const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  clasificacion: { 
    type: String, 
    required: true,
    enum: ['Grano Entero', 'Molido', 'Soluble', 'Capsulas'] 
  },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  imagen: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);