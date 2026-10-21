const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    correo: { type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    direccion: {type: String, required: true},
    rol: {
        type: String, enum: ['cliente', 'admin'], default: 'cliente'
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);