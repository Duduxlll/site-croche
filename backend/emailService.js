const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarCodigo(email, codigo) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Código de Verificação',
    html: `<p>Seu código de verificação é: <strong>${codigo}</strong></p>`,
  });
}

module.exports = { enviarCodigo };
