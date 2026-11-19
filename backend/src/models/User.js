const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    correo: { type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    direccion: {type: String, required: true},
    rol: {
        type: String, enum: ['cliente', 'admin'], default: 'cliente'
    },
    // Recuperación de contraseña: se guarda el hash del token (no el token en sí)
    // y hasta cuándo es válido.
    resetTokenHash: { type: String },
    resetTokenExpira: { type: Date }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);