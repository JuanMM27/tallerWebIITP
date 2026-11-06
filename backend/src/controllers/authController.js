const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const register = async (req, res) => {
    try {
        const { correo, password, nombre, apellido, direccion } = req.body || {};

        if (!correo || !password || !nombre || !apellido || !direccion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.' });
        }

        const existeCorreo = await User.findOne({ correo: correo.toLowerCase() });

        if (existeCorreo) {
            return res.status(400).json({ message: 'Ya existe un usuario registrado con ese email.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = new User ({
            correo,
            password: passwordHash,
            nombre,
            apellido,
            direccion
        });

        const usuarioGuardado = await nuevoUsuario.save();

        return res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            usuario: {
                id: usuarioGuardado._id,
                correo: usuarioGuardado.correo,
                nombre: usuarioGuardado.nombre,
                apellido: usuarioGuardado.apellido,
                direccion: usuarioGuardado.direccion,
                rol: usuarioGuardado.rol
            }
        });

    } catch (error) {
        res.status(400).json({ message: 'Error en el registro', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { correo, password } = req.body || {};

        if (!correo || !password) {
            return res.status(400).json({ message: 'Debe ingresar ambos campos para iniciar sesión.' });
        }

        const usuario = await User.findOne({ correo: correo.toLowerCase() });

        const passwordOk = usuario && await bcrypt.compare(password, usuario.password);

        if (!passwordOk) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({ 
            message: 'Inicio de sesion exitoso.',
            token,
            usuario: {
                id: usuario._id,
                correo: usuario.correo,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                direccion: usuario.direccion,
                rol: usuario.rol
            }    
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
};


module.exports = { register, login };
