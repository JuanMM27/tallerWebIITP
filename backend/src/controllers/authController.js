const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { enviarMail } = require('../config/mailer');

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

const MINUTOS_VALIDEZ_RESET = 15;

const hashearToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Paso 1: el usuario pide recuperar la contraseña con su email.
// Siempre respondemos lo mismo, exista o no la cuenta, para no revelar qué
// emails están registrados.
const solicitarRecuperacion = async (req, res) => {
    try {
        const { correo } = req.body || {};

        if (!correo) {
            return res.status(400).json({ message: 'Ingresá tu email.' });
        }

        const usuario = await User.findOne({ correo: correo.toLowerCase() });

        if (usuario) {
            const token = crypto.randomBytes(32).toString('hex');
            usuario.resetTokenHash = hashearToken(token);
            usuario.resetTokenExpira = new Date(Date.now() + MINUTOS_VALIDEZ_RESET * 60 * 1000);
            await usuario.save();

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
            const enlace = `${frontendUrl}/restablecer-password?token=${token}`;

            try {
                await enviarMail({
                    para: usuario.correo,
                    asunto: 'Restablecé tu contraseña',
                    texto: `Hola ${usuario.nombre}:\n\nRecibimos un pedido para restablecer tu contraseña. Entrá a este enlace para elegir una nueva:\n${enlace}\n\nEl enlace vence en ${MINUTOS_VALIDEZ_RESET} minutos. Si no lo pediste, ignorá este mail.`,
                    html: `
                        <p>Hola ${usuario.nombre}:</p>
                        <p>Recibimos un pedido para restablecer tu contraseña. Hacé clic en el botón para elegir una nueva:</p>
                        <p><a href="${enlace}" style="display:inline-block;padding:12px 24px;background:#6f4e37;color:#fff;text-decoration:none;border-radius:4px;">Restablecer contraseña</a></p>
                        <p>O copiá este enlace en el navegador:<br>${enlace}</p>
                        <p>El enlace vence en ${MINUTOS_VALIDEZ_RESET} minutos. Si no lo pediste, ignorá este mail.</p>
                    `
                });
            } catch (errorMail) {
                // Si el mail no se pudo enviar, el enlace queda en la consola para no
                // bloquear la prueba.
                console.error(`[Mail] No se pudo enviar el mail: ${errorMail.message}`);
                console.log(`[Recuperación de contraseña] Enlace para ${usuario.correo}: ${enlace}`);
            }
        }

        return res.status(200).json({
            message: `Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña. El enlace vence en ${MINUTOS_VALIDEZ_RESET} minutos.`
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar la recuperación', error: error.message });
    }
};

// Paso 2: con el token del enlace, el usuario elige una contraseña nueva.
const restablecerPassword = async (req, res) => {
    try {
        const { token, password } = req.body || {};

        if (!token || !password) {
            return res.status(400).json({ message: 'Faltan datos para restablecer la contraseña.' });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.' });
        }

        const usuario = await User.findOne({
            resetTokenHash: hashearToken(token),
            resetTokenExpira: { $gt: new Date() }
        });

        if (!usuario) {
            return res.status(400).json({ message: 'El enlace no es válido o ya venció. Pedí uno nuevo.' });
        }

        usuario.password = await bcrypt.hash(password, 10);
        // El enlace sirve una sola vez.
        usuario.resetTokenHash = undefined;
        usuario.resetTokenExpira = undefined;
        await usuario.save();

        return res.status(200).json({ message: 'Tu contraseña se actualizó. Ya podés iniciar sesión.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
    }
};

module.exports = { register, login, solicitarRecuperacion, restablecerPassword };
