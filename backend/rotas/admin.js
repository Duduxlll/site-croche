const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");


const crypto = require("crypto");
const nodemailer = require("nodemailer");





router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, erro: "Administrador não encontrado." });
    }

    const admin = result.rows[0];
    const senhaOk = await bcrypt.compare(senha, admin.senha);

    if (!senhaOk) {
      return res.status(401).json({ sucesso: false, erro: "Senha incorreta." });
    }

    res.json({ sucesso: true, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro interno." });
  }
});




const path = require("path");

const fs = require("fs");

// Criar pasta /uploads se não existir
const pastaUploads = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads);

// Configurar multer
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


router.post("/banner", upload.single("banner"), async (req, res) => {
  const nomeArquivo = req.file.filename;

  try {
    await pool.query(`
  INSERT INTO banners (imagem) VALUES ($1)
  ON CONFLICT (id) DO UPDATE SET imagem = $1
`, [nomeArquivo]);



    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao salvar banner." });
  }
});



router.post("/produtos", upload.array("imagens", 3), async (req, res) => {
  const { nome, descricao, preco, tamanhos, categoria } = req.body;

  const imagens = req.files.map(file => file.path); // <-- LINK direto da imagem no Cloudinary

  const imagensJson = JSON.stringify(imagens);

  await pool.query(
    "INSERT INTO produtos (nome, descricao, preco, tamanhos, imagens, categoria) VALUES ($1, $2, $3, $4, $5, $6)",
    [nome, descricao, preco, tamanhos, imagensJson, categoria]
  );

  res.json({ sucesso: true });
});



router.get("/categorias", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL");
    const categorias = resultado.rows.map(row => row.categoria);
    res.json({ sucesso: true, categorias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar categorias." });
  }
});


router.get("/produtos", async (req, res) => {
  const { categoria, nome } = req.query;
  try {
    let query = "SELECT * FROM produtos WHERE 1=1";
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND categoria = $${params.length}`;
    }

    if (nome) {
      params.push(`%${nome}%`);
      query += ` AND nome ILIKE $${params.length}`;
    }

    const resultado = await pool.query(query, params);
    res.json({ sucesso: true, produtos: resultado.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar produtos." });
  }
});




router.delete("/produtos/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const produto = await pool.query("SELECT imagens FROM produtos WHERE id = $1", [id]);

    if (produto.rows.length === 0) return res.status(404).json({ sucesso: false, erro: "Produto não encontrado." });

    const imagens = JSON.parse(produto.rows[0].imagens || "[]");
imagens.forEach(nome => { const caminho = path.join(pastaUploads, nome);
if (fs.existsSync(caminho)) fs.unlinkSync(caminho);

  
});


    await pool.query("DELETE FROM produtos WHERE id = $1", [id]);

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao remover produto." });
  }
});

router.put("/produtos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, tamanhos, categoria } = req.body;

  console.log("Recebido para edição:", { id, nome, descricao, preco, tamanhos });

  try {
    await pool.query(
  `UPDATE produtos 
   SET nome = $1, descricao = $2, preco = $3, tamanhos = $4, categoria = $5
   WHERE id = $6`,
  [nome, descricao, preco, tamanhos, categoria, id]
);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao editar produto:", err);
    res.status(500).json({ sucesso: false, erro: "Erro ao editar produto." });
  }
});


router.get("/tamanhos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tamanhos ORDER BY nome ASC");
    res.json({ sucesso: true, tamanhos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao listar tamanhos." });
  }
});

router.post("/tamanhos", async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ sucesso: false, erro: "Nome é obrigatório." });

  try {
    await pool.query("INSERT INTO tamanhos (nome) VALUES ($1) ON CONFLICT DO NOTHING", [nome]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao adicionar tamanho." });
  }
});

router.delete("/tamanhos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM tamanhos WHERE id = $1", [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao remover tamanho." });
  }
});


// EXPORTAR
router.get("/exportar-produtos", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    const header = "ID,Nome,Descrição,Preço,Tamanhos,Criado em\n";
    const linhas = resultado.rows.map(p => [p.id, `"${p.nome.replace(/"/g, '""')}"`, `"${p.descricao.replace(/"/g, '""')}"`, parseFloat(p.preco).toFixed(2), `"${p.tamanhos}"`, new Date(p.criado_em).toLocaleString()].join(","));
    const csv = header + linhas.join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("produtos.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao exportar produtos.");
  }
});
// Atualizar destaque de um produto
router.post("/produtos/:id/destaque", async (req, res) => {
  const { id } = req.params;
  const { destaque } = req.body;

  try {
    await pool.query("UPDATE produtos SET destaque = $1 WHERE id = $2", [destaque, id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: "Erro ao atualizar destaque" });
  }
});





// MÉTRICAS
router.get("/metricas", async (req, res) => {
  try {
    const [totalProdutos, totalDestaques, ultimoProduto] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM produtos"),
      pool.query("SELECT COUNT(*) AS total FROM produtos WHERE destaque = true"),
      pool.query("SELECT nome, criado_em FROM produtos ORDER BY id DESC LIMIT 1")
    ]);

    res.json({
      sucesso: true,
      totalProdutos: totalProdutos.rows[0].total,
      totalDestaques: totalDestaques.rows[0].total,
      ultimoProduto: ultimoProduto.rows[0] || null
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, erro: "Erro ao carregar métricas." });
  }
});



// ROTAS DE CATEGORIA
router.get("/categorias-gerenciar", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM categorias ORDER BY id DESC");
    res.json({ sucesso: true, categorias: resultado.rows });
  } catch (erro) {
    console.error("Erro ao buscar categorias:", erro);
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar categorias" });
  }
});

router.post("/categorias", async (req, res) => {
  const { nome } = req.body;
  await pool.query("INSERT INTO categorias (nome) VALUES ($1)", [nome]);
  res.json({ sucesso: true });
});

router.put("/categorias/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  await pool.query("UPDATE categorias SET nome = $1 WHERE id = $2", [nome, id]);
  res.json({ sucesso: true });
});

router.delete("/categorias/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
  res.json({ sucesso: true });
});








module.exports = router;