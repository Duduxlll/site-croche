document.getElementById("sair-painel").addEventListener("click", () => {
  localStorage.removeItem("admin");
  window.location.href = "loginpainel.html";
});

document.getElementById("form-banner").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  const res = await fetch("https://site-croche.onrender.com/admin/banner", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  if (data.sucesso) {
    notificar("Banner atualizado com sucesso!", "sucesso");
  } else {
    notificar(data.erro || "Erro ao enviar banner", "erro");
  }
});



document.getElementById("form-produto").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = this;
  const formData = new FormData();

  const tamanhosSelecionados = [];
  form.querySelectorAll('input[name="tamanhos"]:checked').forEach(input => {
    tamanhosSelecionados.push(input.value);
  });

  const categoria = form.querySelector("#categoria-produto").value; // ✅ CORREÇÃO AQUI

  formData.append("nome", form.nome.value);
  formData.append("descricao", form.descricao.value);
  formData.append("preco", form.preco.value);
  formData.append("tamanhos", JSON.stringify(tamanhosSelecionados));
  formData.append("categoria", categoria);



  [...form.imagens.files].forEach(imagem => {
    formData.append("imagens", imagem);
  });

  try {
    const resposta = await fetch("https://site-croche.onrender.com/admin/produtos", {
      method: "POST",
      body: formData
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
      notificar("Produto cadastrado com sucesso!", "sucesso");
      form.reset();
    } else {
      notificar("Erro ao cadastrar produto.", "erro");
    }
  } catch (erro) {
    console.error(erro);
    notificar("Erro ao conectar com o servidor.", "erro");
  }
});


async function carregarProdutos() {
  const nome = document.getElementById("filtro-nome")?.value || "";
  const categoria = document.getElementById("filtro-categoria")?.value || "";

  const query = new URLSearchParams();
  if (nome) query.append("nome", nome);
  if (categoria) query.append("categoria", categoria);

  const res = await fetch(`https://site-croche.onrender.com/admin/produtos?${query}`);
  const data = await res.json();
  const lista = document.getElementById("lista-produtos");

  lista.innerHTML = "";

  if (data.sucesso) {
    data.produtos.forEach(produto => {
      const div = document.createElement("div");
      div.className = "item-produto";

      div.innerHTML = `
        <strong>${produto.nome}</strong> - R$ ${parseFloat(produto.preco).toFixed(2)}<br>
        <small>${produto.tamanhos}</small><br>
      `;

      const acoes = document.createElement("div");
      acoes.classList.add("acoes");

      // Botão Editar
      const botaoEditar = document.createElement("button");
      botaoEditar.textContent = "Editar";
      botaoEditar.addEventListener("click", () => abrirModalEdicao(produto));
      acoes.appendChild(botaoEditar);

      // Botão Excluir
      const botaoExcluir = document.createElement("button");
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.addEventListener("click", () => removerProduto(produto.id));
      acoes.appendChild(botaoExcluir);

      // ✅ Botão Visualizar
      const botaoVisualizar = document.createElement("button");
      botaoVisualizar.textContent = "Visualizar";
      botaoVisualizar.addEventListener("click", () => {
        window.open(`../produto.html?id=${produto.id}`, "_blank");
      });
      acoes.appendChild(botaoVisualizar);

      div.appendChild(acoes);
      lista.appendChild(div);
    });
  }
}




async function removerProduto(id) {
  if (!confirm("Tem certeza que deseja remover este produto?")) return;

  const res = await fetch(`https://site-croche.onrender.com/admin/produtos/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (data.sucesso) {
    notificar("Produto removido com sucesso!", "sucesso");
    carregarProdutos();
  } else {
    notificar(data.erro || "Erro ao remover produto", "erro");
  }
}

function filtrarProdutos() {
  carregarProdutos();
}


const modal = document.getElementById("modal-edicao");
const btnSalvar = document.getElementById("salvar-edicao");
const btnCancelar = document.getElementById("cancelar-edicao");
const btnFechar = document.getElementById("fechar-modal");

// Variável temporária para armazenar ID do produto
let produtoEditandoId = null;

// Função para abrir o modal com dados preenchidos
function abrirModalEdicao(produto) {
  produtoEditandoId = produto.id;
  document.getElementById("editar-nome").value = produto.nome;
  document.getElementById("editar-descricao").value = produto.descricao;
  document.getElementById("editar-preco").value = produto.preco;
  document.getElementById("editar-tamanhos").value = produto.tamanhos;
document.getElementById("editar-categoria").value = produto.categoria || "";

  modal.classList.remove("hidden");
  
}

// Função para fechar o modal
function fecharModal() {
  modal.classList.add("hidden");
  produtoEditandoId = null;
}

// Clicar em cancelar ou fechar (X)
btnCancelar.addEventListener("click", fecharModal);
btnFechar.addEventListener("click", fecharModal);

// Clicar em salvar
btnSalvar.addEventListener("click", async () => {
  const nome = document.getElementById("editar-nome").value.trim();
  const descricao = document.getElementById("editar-descricao").value.trim();
  const preco = document.getElementById("editar-preco").value.replace(",", ".");

  const tamanhos = document.getElementById("editar-tamanhos").value;
  const categoria = document.getElementById("editar-categoria").value;

  if (!nome || !descricao || !preco || !tamanhos) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const resposta = await fetch(`https://site-croche.onrender.com/admin/produtos/${produtoEditandoId}`, {

      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao, preco, tamanhos, categoria })
,
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      alert("Produto atualizado com sucesso!");
      fecharModal();
      carregarProdutos(); // Recarrega a lista
    } else {
      alert("Erro ao salvar alterações.");
    }
  } catch (erro) {
    console.error("Erro ao editar:", erro);
    alert("Erro na requisição.");
  }
});



async function carregarCategorias() {
  try {
    const res = await fetch("https://site-croche.onrender.com/admin/categorias");
    const data = await res.json();
    if (data.sucesso) {
      const select = document.getElementById("filtro-categoria");
      data.categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar categorias:", erro);
  }
}

carregarCategorias();





async function carregarTamanhos() {
  const res = await fetch("https://site-croche.onrender.com/admin/tamanhos");
  const data = await res.json();
  const lista = document.getElementById("lista-tamanhos");
  lista.innerHTML = "";

  if (data.sucesso) {
    data.tamanhos.forEach(tam => {
      const div = document.createElement("div");
      div.className = "item-tamanho";
      div.innerHTML = `${tam.nome} <button onclick="removerTamanho(${tam.id})">×</button>`;
      lista.appendChild(div);
    });

    // Atualiza checkboxes dos formulários
    atualizarCheckboxes(data.tamanhos);
  }
}

function atualizarCheckboxes(tamanhos) {
  document.querySelectorAll(".checkboxes").forEach(box => {
    box.innerHTML = "";
    tamanhos.forEach(t => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="tamanhos" value="${t.nome}"> ${t.nome}`;
      box.appendChild(label);
    });
  });
}

document.getElementById("form-tamanho").addEventListener("submit", async function (e) {
  e.preventDefault();
  const nome = this.nome.value;

  const res = await fetch("https://site-croche.onrender.com/admin/tamanhos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome })
  });

  const data = await res.json();
  if (data.sucesso) {
    notificar("Tamanho adicionado!", "sucesso");
    this.reset();
    carregarTamanhos();
  } else {
    notificar(data.erro || "Erro ao adicionar tamanho", "erro");
  }
});

async function removerTamanho(id) {
  if (!confirm("Remover este tamanho?")) return;

  const res = await fetch(`https://site-croche.onrender.com/admin/tamanhos/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (data.sucesso) {
    notificar("Tamanho removido!", "sucesso");
    carregarTamanhos();
  } else {
    notificar(data.erro || "Erro ao remover tamanho", "erro");
  }
}

carregarTamanhos();


document.getElementById("btn-exportar").addEventListener("click", async () => {
  const res = await fetch("https://site-croche.onrender.com/admin/exportar-produtos");
  const csv = await res.text();

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "produtos.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  notificar("Exportação concluída!", "sucesso");
});


async function carregarProdutosParaDestaque() {
  const res = await fetch("https://site-croche.onrender.com/admin/produtos")
;
  const dados = await res.json();
  const container = document.getElementById("lista-destaques");

  container.innerHTML = "";

  if (!dados.produtos || dados.produtos.length === 0) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }
  

  dados.produtos.forEach(produto => {
  const item = document.createElement("div");
  item.classList.add("produto-destaque-item");

  item.innerHTML = `<p><strong>${produto.nome}</strong></p>`;

  if (produto.destaque) {
    const destaqueInfo = document.createElement("p");
    destaqueInfo.textContent = "✅ Este produto está em destaque";

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover destaque";
    btnRemover.onclick = () => removerDestaque(produto.id);

    item.appendChild(destaqueInfo);
    item.appendChild(btnRemover);
  } else {
    const btnDestaque = document.createElement("button");
    btnDestaque.textContent = "Marcar como destaque";
    btnDestaque.onclick = () => definirDestaque(produto.id);
    item.appendChild(btnDestaque);
  }

  container.appendChild(item);
});
}





async function removerDestaque(id) {
  await fetch(`https://site-croche.onrender.com/admin/produtos/${id}/destaque`, {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destaque: false })
  });
  mostrarNotificacao("Produto removido dos destaques.");
  carregarProdutos();
}


async function definirDestaque(id) {
  try {
    const res = await fetch(`https://site-croche.onrender.com/admin/produtos/${id}/destaque`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ destaque: true })
    });

    const data = await res.json();
    if (data.sucesso) {
      alert("Produto marcado como destaque!");
      carregarProdutosParaDestaque();
    } else {
      alert("Erro ao marcar destaque.");
    }
  } catch (erro) {
    console.error("Erro ao conectar com backend:", erro);
    alert("Erro ao marcar destaque.");
  }
}


function mostrarAba(abaId) {
  document.querySelectorAll(".aba-secao").forEach(secao => secao.classList.add("hidden"));
  document.getElementById(`aba-${abaId}`).classList.remove("hidden");

  if (abaId === "metricas") carregarMetricasPainel();
}

async function carregarMetricasPainel() {
  try {
    const res = await fetch("https://site-croche.onrender.com/admin/metricas");
    const dados = await res.json();

    if (dados.sucesso) {
      document.getElementById("total-produtos").innerText = dados.totalProdutos;
      document.getElementById("total-destaques").innerText = dados.totalDestaques;
      document.getElementById("ultimo-produto").innerText = dados.ultimoProduto
        ? `${dados.ultimoProduto.nome} (${new Date(dados.ultimoProduto.criado_em).toLocaleDateString()})`
        : "Nenhum";
    }
  } catch (erro) {
    console.error("Erro ao carregar métricas:", erro);
  }
}

function mostrarSecao(id) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "aba-categorias") carregarCategorias(); // ✅ ATUALIZA!
}



async function carregarCategorias() {
  const res = await fetch("https://site-croche.onrender.com/admin/categorias-gerenciar");
  const data = await res.json();

  if (data.sucesso) {
    const lista = document.getElementById("lista-categorias");
    lista.innerHTML = "";

    data.categorias.forEach(cat => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="text" value="${cat.nome}" data-id="${cat.id}">
        <button onclick="salvarCategoria(${cat.id}, this)">Salvar</button>
        <button onclick="excluirCategoria(${cat.id})">Excluir</button>
      `;
      lista.appendChild(li);
    });

    atualizarSelectCategorias(data.categorias);
  }
}

async function salvarCategoria(id, btn) {
  const nome = btn.parentElement.querySelector("input").value;
  await fetch(`https://site-croche.onrender.com/admin/categorias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome })
  });
  carregarCategorias();
}

async function excluirCategoria(id) {
  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    await fetch(`https://site-croche.onrender.com/admin/categorias/${id}`, {
      method: "DELETE"
    });
    carregarCategorias();
  }
}

document.getElementById("form-categoria").addEventListener("submit", async e => {
  e.preventDefault();
  const nome = document.getElementById("nova-categoria").value.trim();
  if (nome) {
    await fetch("https://site-croche.onrender.com/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });
    document.getElementById("nova-categoria").value = "";
    carregarCategorias();
  }
});

function atualizarSelectCategorias(categorias) {
  const selects = document.querySelectorAll(".select-categorias");
  selects.forEach(select => {
    select.innerHTML = "<option value=''>Selecione</option>" + categorias.map(c => `<option value="${c.nome}">${c.nome}</option>`).join("");
  });
}

// Chamar ao entrar na aba
document.querySelector('button[data-aba="categorias"]').addEventListener("click", () => {
  mostrarSecao("aba-categorias");
  carregarCategorias();
});






// Chamar no carregamento da página
carregarMetricasPainel();



carregarProdutosParaDestaque();