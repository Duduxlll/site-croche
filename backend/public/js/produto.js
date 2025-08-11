const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const container = document.getElementById("detalhes-produto");

if (!id) {
  container.innerHTML = "<p>Produto não encontrado.</p>";
} else {
  fetch(`https://site-croche.onrender.com/site/produtos/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.sucesso || !data.produto) {
        container.innerHTML = "<p>Produto não encontrado.</p>";
        return;
      }

      const p = data.produto;
      const imagens = JSON.parse(p.imagens || "[]");
      const tamanhos = JSON.parse(p.tamanhos || "[]");
      

      const imagemHTML = imagens.map(img =>
  `<img src="${img}" alt="${p.nome}" onclick="abrirZoom(this.src)">`
).join("");



      container.innerHTML = `
        <div class="galeria">${imagemHTML}</div>
        <h2>${p.nome}</h2>
        <p class="preco">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p>
        <p class="descricao">${p.descricao}</p>

        <div class="encomenda">
          <label for="tamanho">Tamanho:</label>
          <select id="tamanho">
            <option value="">Selecione</option>
            ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
          </select>

          <label for="cor">Cor desejada:</label>
          <input type="text" id="cor" placeholder="Ex: Azul, Bege, Rosa...">

          <button onclick="encomendar('${p.nome}')">
            <img src="imagens/whatsapp-icon.svg" alt="WhatsApp">
            Fazer encomenda via WhatsApp
          </button>
        </div>
      `;
    });
}

function encomendar(nomeProduto) {
  const tamanho = document.getElementById("tamanho").value;
  const cor = document.getElementById("cor").value;

  const texto = `Olá! Vim pelo site e gostaria de encomendar o produto "${nomeProduto}".\nTamanho: ${tamanho}\nCor: ${cor}`;
  const url = `https://wa.me/5591985725143?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}
