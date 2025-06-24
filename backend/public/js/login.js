document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const senha = document.querySelector('input[type="password"]').value;

  const res = await fetch("https://site-croche.onrender.com/login", {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await res.json();

  if (data.sucesso) {
  localStorage.setItem("usuario", JSON.stringify(data.usuario));
  notificar("Login feito com sucesso! Redirecionando...");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}
 else {
    notificar("Erro no login: " + data.erro);
  }
});
