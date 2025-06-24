document.getElementById("form-redefinir").addEventListener("submit", async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  const codigo = document.getElementById("codigo").value;
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (novaSenha !== confirmarSenha) {
    document.getElementById("mensagem").textContent = "As senhas não coincidem.";
    return;
  }

  try {
    const resposta = await fetch("http://site-croche.onrender.com/site/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo, novaSenha })
    });

    const dados = await resposta.json();
    document.getElementById("mensagem").textContent = dados.mensagem || dados.erro;

    if (dados.sucesso) {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  } catch (err) {
    document.getElementById("mensagem").textContent = "Erro ao redefinir senha.";
  }
});

