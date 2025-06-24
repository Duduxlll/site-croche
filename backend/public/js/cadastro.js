document.getElementById("form-cadastro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.querySelector('input[placeholder="Nome completo"]').value;
  const email = document.querySelector('#email').value;
  const telefone = document.querySelector('input[placeholder="Telefone"]').value;
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar-senha").value;
  const codigo = document.querySelector('input[placeholder*="Código"]').value;

  if (senha !== confirmar) {
    alert("Senhas diferentes!");
    return;
  }

  const res = await fetch("http://localhost:3000/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, telefone, senha, codigoDigitado: codigo }),
  });

  const data = await res.json();

  if (data.sucesso) {
    notificar("Cadastro realizado com sucesso! Redirecionando para o login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500); // Espera 1.5s e redireciona
  } else {
    notificar("Erro no cadastro: " + data.erro, "erro");
  }
});

