const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');

const ADMIN = {
    correo: process.env.ADMIN_CORREO || 'admin@terra.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    nombre: 'Admin',
    apellido: 'Terra',
    direccion: 'Sin dirección'
};

const crearAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const existe = await User.findOne({ correo: ADMIN.correo });
        if (existe) {
            console.log(`Ya existe un usuario con el correo ${ADMIN.correo}. No se creó nada.`);
            return;
        }

        const passwordHash = await bcrypt.hash(ADMIN.password, 10);
        await User.create({ ...ADMIN, password: passwordHash, rol: 'admin' });

        console.log(`Administrador creado: ${ADMIN.correo}`);
    } catch (error) {
        console.error('Error al crear el administrador:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

crearAdmin();