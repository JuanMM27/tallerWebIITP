const nodemailer = require('nodemailer');

// Si el .env tiene SMTP_HOST, SMTP_USER y SMTP_PASS se usa ese servidor de correo.
// Si no, se crea automáticamente una cuenta de prueba en Ethereal (https://ethereal.email):
// los mails no llegan a nadie de verdad, quedan en una bandeja web que se puede ver
// con el enlace que se imprime en la consola.
let transporterPromise = null;

const crearTransporter = async () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const port = Number(SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }

  const cuenta = await nodemailer.createTestAccount();
  console.log(`[Mail] Usando cuenta de prueba de Ethereal: ${cuenta.user}`);
  return nodemailer.createTransport({
    host: cuenta.smtp.host,
    port: cuenta.smtp.port,
    secure: cuenta.smtp.secure,
    auth: { user: cuenta.user, pass: cuenta.pass }
  });
};

const obtenerTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = crearTransporter().catch((error) => {
      // Si falla (por ejemplo, sin internet), se reintenta en el próximo envío.
      transporterPromise = null;
      throw error;
    });
  }
  return transporterPromise;
};

const enviarMail = async ({ para, asunto, texto, html }) => {
  const transporter = await obtenerTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Terra Café <no-responder@terra.com>',
    to: para,
    subject: asunto,
    text: texto,
    html
  });

  // Solo devuelve un enlace cuando el mail se envió por Ethereal.
  const vistaPrevia = nodemailer.getTestMessageUrl(info);
  if (vistaPrevia) {
    console.log(`[Mail] Ver el mail enviado a ${para}: ${vistaPrevia}`);
  }

  return info;
};

module.exports = { enviarMail };
