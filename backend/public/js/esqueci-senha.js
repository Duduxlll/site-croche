document.getElementById("form-esqueci").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  try {
    const resposta = await fetch("https://site-croche.onrender.com/site/esqueci-senha", {


      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const dados = await resposta.json();
    document.getElementById("mensagem").textContent = dados.mensagem || dados.erro;

    if (dados.sucesso) {
      setTimeout(() => {
        window.location.href = "redefinir-senha.html?email=" + encodeURIComponent(email);
      }, 2000);
    }
  } catch (err) {
    document.getElementById("mensagem").textContent = "Erro ao enviar. Tente novamente.", "erro";
  }
});



