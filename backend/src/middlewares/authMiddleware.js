const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Debe iniciar sesión.' });
    }

    const token = header.split(' ')[1];

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = datos;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Sesión inválida o expirada. Vuelva a iniciar sesión.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ message: 'No tiene permisos para realizar esta acción.' });
    }
    next();
};

module.exports = { verifyToken, requireAdmin };
