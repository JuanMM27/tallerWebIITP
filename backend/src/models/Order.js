const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  productos: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      precioUnitario: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Pago', 'Entregado'], 
    default: 'Pendiente' 
  },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);