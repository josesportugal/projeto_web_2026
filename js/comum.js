/* ==========================================================
   FUNÇÕES COMUNS A TODAS AS PÁGINAS
   ========================================================== */

/* Menu "hambúrguer" para telemóvel */
const botaoMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");
if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", function () {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
  });
}

/* Ano atual no rodapé */
const anoRodape = document.getElementById("ano");
if (anoRodape) anoRodape.textContent = new Date().getFullYear();

/* Botão "voltar ao topo" */
const botaoTopo = document.getElementById("voltar-topo");
if (botaoTopo) {
  window.addEventListener("scroll", function () {
    botaoTopo.classList.toggle("visivel", window.scrollY > 400);
  });
  botaoTopo.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
