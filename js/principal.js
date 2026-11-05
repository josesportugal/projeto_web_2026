/* ==========================================================
   PÁGINA INICIAL: pesquisa rápida
   ========================================================== */

/* Leva para a página escolhida com o texto no endereço (ex.: equora_cavalos.html?q=lusitano) */
document.getElementById("pesquisa-rapida").addEventListener("submit", function (e) {
  e.preventDefault();
  const texto = document.getElementById("pr-texto").value.trim();
  const destino = document.getElementById("pr-categoria").value;   // ex.: "cavalos"
  window.location.href = "equora_" + destino + ".html" + (texto ? "?q=" + encodeURIComponent(texto) : "");
});
