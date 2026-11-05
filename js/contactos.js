/* ==========================================================
   CONTACTOS: validação do formulário e envio simulado
   ========================================================== */

const formContacto = document.getElementById("form-contacto");

function erroContacto(campo, mensagem) {
  document.getElementById("erro-" + campo).textContent = mensagem;
  document.getElementById(campo).classList.add("invalido");
}
function limparContacto() {
  document.querySelectorAll("#form-contacto .erro").forEach(s => s.textContent = "");
  document.querySelectorAll("#form-contacto .invalido").forEach(i => i.classList.remove("invalido"));
}

formContacto.addEventListener("submit", function (e) {
  e.preventDefault();
  limparContacto();
  let valido = true;

  const nome = document.getElementById("nome").value.trim();
  if (nome.length < 3) { erroContacto("nome", "Escreve o teu nome (mínimo 3 letras)."); valido = false; }

  const email = document.getElementById("email").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { erroContacto("email", "Escreve um e-mail válido."); valido = false; }

  if (!document.getElementById("assunto").value) { erroContacto("assunto", "Escolhe o assunto."); valido = false; }

  const mensagem = document.getElementById("mensagem").value.trim();
  if (mensagem.length < 10) { erroContacto("mensagem", "A mensagem deve ter pelo menos 10 caracteres."); valido = false; }

  if (!document.getElementById("consentimento").checked) {
    document.getElementById("erro-consentimento").textContent = "Tens de aceitar o tratamento dos dados para enviar.";
    valido = false;
  }

  if (!valido) return;

  /* envio simulado (não há servidor) */
  document.getElementById("confirmacao-texto").textContent =
    `Obrigado, ${nome}! Recebemos a tua mensagem e vamos responder para ${email} em breve.`;
  document.getElementById("confirmacao").hidden = false;
  document.getElementById("confirmacao").scrollIntoView({ behavior: "smooth", block: "center" });
  formContacto.reset();
});

/* contador de caracteres da mensagem */
const caixaMensagem = document.getElementById("mensagem");
caixaMensagem.addEventListener("input", function () {
  document.getElementById("contador-msg").textContent = caixaMensagem.value.length + " / 500";
});
