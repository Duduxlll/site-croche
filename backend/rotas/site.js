const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const nodemailer = require("nodemailer");

// Requisição de recuperação
router.post("/esqueci-senha", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, erro: "Email não encontrado." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query("INSERT INTO recuperacoes (email, codigo) VALUES ($1, $2)", [email, codigo]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "crocheapp1@gmail.com",
        pass: "ssiqxsdvueiprysl"
      }
    });

    await transporter.sendMail({
      from: '"Crochê da Suelem" <crocheapp1@gmail.com>',
      to: email,
      subject: "Código de recuperação de senha",
      text: `Seu código de recuperação é: ${codigo}`
    });

    res.json({ sucesso: true, mensagem: "Código enviado para o e-mail." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao enviar código." });
  }
});

// Redefinir senha
router.post("/redefinir-senha", async (req, res) => {
  const { email, codigo, novaSenha } = req.body;

  try {
    const resultado = await pool.query(
      `SELECT * FROM recuperacoes 
       WHERE email = $1 AND codigo = $2 AND criado_em >= NOW() - INTERVAL '15 minutes' 
       ORDER BY criado_em DESC LIMIT 1`, 
      [email, codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ sucesso: false, erro: "Código inválido ou expirado." });
    }

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query("UPDATE usuarios SET senha = $1 WHERE email = $2", [hash, email]);

    await pool.query("DELETE FROM recuperacoes WHERE email = $1", [email]);

    res.json({ sucesso: true, mensagem: "Senha redefinida com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao redefinir senha." });
  }
});








router.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id DESC");
    res.json({ sucesso: true, produtos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar produtos." });
  }
});



router.get("/produtos-destaque", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos WHERE destaque = true ORDER BY id DESC LIMIT 3");
    res.json({ sucesso: true, produtos: result.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar destaques." });
  }
});





router.get("/produtos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query("SELECT * FROM produtos WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.json({ sucesso: false, erro: "Produto não encontrado" });
    }

    res.json({ sucesso: true, produto: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, erro: "Erro no servidor" });
  }
});

module.exports = router;
