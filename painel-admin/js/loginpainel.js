document.getElementById("form-admin-login").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("http://localhost:3000/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (data.sucesso) {
    localStorage.setItem("admin", JSON.stringify(data.admin));
    window.location.href = "dashboard.html";
  } else {
    notificar(data.erro || "Erro ao logar", "erro");
  }
});
