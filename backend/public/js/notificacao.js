function notificar(mensagem, tipo = "info") {
  const container = document.getElementById("notificacoes-container");
  if (!container) return;

  const el = document.createElement("div");
  el.classList.add("notificacao");
  if (tipo === "sucesso") el.classList.add("sucesso");
  if (tipo === "erro") el.classList.add("erro");
  el.textContent = mensagem;

  container.appendChild(el);

  setTimeout(() => {
    container.removeChild(el);
  }, 4000); // dura 4 segundos
}


function mostrarNotificacao(texto, tipo = "erro") {
  const container = document.getElementById("notificacoes-container");
  const div = document.createElement("div");
  div.className = `notificacao ${tipo}`;
  div.innerText = texto;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 4000);
}
