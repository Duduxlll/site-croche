const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");

const pool = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const adminRotas = require("./rotas/admin");
app.use("/admin", adminRotas);

const siteRotas = require("./rotas/site");
app.use("/site", siteRotas);




const path = require("path");

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "public")));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Rota de cadastro com criptografia
app.post('/cadastro', async (req, res) => {
  const { nome, email, telefone, senha, codigoDigitado } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT codigo_email FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0 || resultado.rows[0].codigo_email !== codigoDigitado) {
      return res.status(400).json({ sucesso: false, erro: 'Código de verificação inválido.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    await pool.query(`
      UPDATE usuarios SET nome = $1, telefone = $2, senha = $3, verificado = true
      WHERE email = $4
    `, [nome, telefone, hash, email]);

    res.status(201).json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});


// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, erro: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, erro: 'Senha incorreta' });
    }

    // Login bem-sucedido
    res.json({ sucesso: true, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});


const { enviarCodigo } = require('./emailService');

app.post('/enviar-codigo', async (req, res) => {
  const { email } = req.body;
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await enviarCodigo(email, codigo);

    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (resultado.rows.length > 0) {
      // usuário já existe, só atualiza o código
      await pool.query(
        'UPDATE usuarios SET codigo_email = $1 WHERE email = $2',
        [codigo, email]
      );
    } else {
      // insere novo registro com email e código, usa nome temporário "pendente"
      await pool.query(
        'INSERT INTO usuarios (nome, email, codigo_email, senha) VALUES ($1, $2, $3, $4)',
        ['pendente', email, codigo, 'pendente']
      );
    }

    res.json({ sucesso: true, mensagem: 'Código enviado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});


app.post("/contato", async (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ sucesso: false, erro: "Campos obrigatórios." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_REMETENTE,
        pass: process.env.EMAIL_SENHA
      }
    });

    await transporter.sendMail({
      from: `"Site Crochê" <${process.env.EMAIL_REMETENTE}>`,
      to: "crocheapp1@gmail.com",
      subject: "Nova mensagem do site",
      html: `
        <h2>Mensagem do Fale Conosco</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong><br>${mensagem}</p>
      `
    });

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao enviar e-mail." });
  }
});




