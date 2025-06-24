


// script.js

// Verifica se estamos na página de produto
if (window.location.pathname.includes("produto.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"));

  const produto = produtos.find(p => p.id === id);

  const container = document.getElementById("detalhe-produto");

  if (produto) {
    container.innerHTML = `
      <div class="detalhe-produto">
        <img src="${produto.imagem}" alt="${produto.nome}">
        <div class="info">
          <h2>${produto.nome}</h2>
          <p class="preco">${produto.preco}</p>
          <p>${produto.descricao}</p>
          <a class="botao" href="https://wa.me/SEUNUMERO?text=Tenho%20interesse%20em%20${encodeURIComponent(produto.nome)}" target="_blank">Comprar via WhatsApp</a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = "<p>Produto não encontrado.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const loginLink = document.getElementById("login-link");
  const usuarioLogado = document.getElementById("usuario-logado");
  const iconeUsuario = document.getElementById("icone-usuario");
  const janelaUsuario = document.getElementById("janela-usuario");
  const fecharJanela = document.getElementById("fechar-janela");
  const btnLogout = document.getElementById("logout");

  if (usuario) {
    loginLink.style.display = "none";
    usuarioLogado.style.display = "inline-block";
  }

  if (iconeUsuario) {
    iconeUsuario.addEventListener("click", () => {
      janelaUsuario.style.display = "flex";
    });
  }

  if (fecharJanela) {
    fecharJanela.addEventListener("click", () => {
      janelaUsuario.style.display = "none";
    });
  }

  if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    notificar("Você saiu da conta!", "sucesso");

    // Espera 1 segundo antes de redirecionar
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
}

});

function fazerEncomenda(botao, produto) {
  const container = botao.parentElement;
  const tamanho = container.querySelector(".tamanho").value;
  const cor = container.querySelector(".cor").value;

  if (!tamanho || !cor) {
    notificar("Selecione o tamanho e a cor para encomendar!", "erro");
    return;
  }

  const texto = `Oi, vim pelo site e gostaria de encomendar o produto: ${produto}.
Tamanho: ${tamanho}
Cor desejada: ${cor}
Pode me informar as opções disponíveis?`;

  const telefone = "91984633167"; // Ex: 5599999999999 (sem + ou espaços)
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}


document.getElementById("form-contato").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.querySelector('input[name="nome"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const mensagem = document.querySelector('textarea[name="mensagem"]').value;

  const res = await fetch("https://site-croche.onrender.com/contato", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, mensagem })
  });

  const data = await res.json();

  if (data.sucesso) {
    notificar("Mensagem enviada com sucesso!", "sucesso");
    document.getElementById("form-contato").reset();
  } else {
    notificar("Erro ao enviar mensagem.", "erro");
  }
});




