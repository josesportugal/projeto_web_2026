/* ==========================================================
   LISTAS COM FILTROS (Campos, Cavalos e Equipamento)
   Os cartões estão escritos no HTML. Cada cartão tem atributos
   data-… (ex.: data-raca="Lusitano" data-preco="30") e este
   código só mostra ou esconde os cartões conforme os filtros.
   ========================================================== */

const cartoes = document.querySelectorAll("#lista .cartao");
const campoPesquisa = document.getElementById("pesquisa");
const campoPreco = document.getElementById("filtro-preco");
const selects = document.querySelectorAll("select[data-filtro]");
const contador = document.getElementById("contador");
const semResultados = document.getElementById("sem-resultados");

/* Se vier um texto no endereço (ex.: ?q=lusitano), preenche a pesquisa */
const textoUrl = new URLSearchParams(window.location.search).get("q");
if (textoUrl) campoPesquisa.value = textoUrl;

function filtrar() {
  const texto = campoPesquisa.value.trim().toLowerCase();
  const precoMax = Number(campoPreco.value);
  document.getElementById("valor-preco").textContent = precoMax + " " + campoPreco.dataset.unidade;

  let visiveis = 0;
  cartoes.forEach(function (cartao) {
    let mostrar = true;

    if (Number(cartao.dataset.preco) > precoMax) mostrar = false;
    if (texto && !cartao.textContent.toLowerCase().includes(texto)) mostrar = false;

    /* cada select compara o seu valor com o atributo data-… do cartão */
    selects.forEach(function (select) {
      const campo = select.dataset.filtro;        // ex.: "raca"
      if (select.value && cartao.dataset[campo] !== select.value) mostrar = false;
    });

    cartao.hidden = !mostrar;
    if (mostrar) visiveis++;
  });

  contador.textContent = visiveis === 1 ? "1 resultado" : visiveis + " resultados";
  semResultados.hidden = visiveis !== 0;
}

/* Qualquer alteração nos filtros atualiza a lista */
campoPesquisa.addEventListener("input", filtrar);
campoPreco.addEventListener("input", filtrar);
selects.forEach(s => s.addEventListener("change", filtrar));

document.getElementById("limpar").addEventListener("click", function () {
  campoPesquisa.value = "";
  selects.forEach(s => s.value = "");
  campoPreco.value = campoPreco.max;
  filtrar();
});

filtrar();

/* ==========================================================
   LISTA <-> DETALHE (as duas vistas estão na mesma página)
   Endereço sem nada          -> mostra a lista
   Endereço com #item-3       -> mostra só o detalhe do item 3
   ========================================================== */

const vistaLista = document.getElementById("vista-lista");
const vistaDetalhe = document.getElementById("vista-detalhe");
const itensDetalhe = document.querySelectorAll(".detalhe-item");

function mostrarVista() {
  const escolhido = document.getElementById(window.location.hash.slice(1));
  const temDetalhe = escolhido !== null && escolhido.classList.contains("detalhe-item");

  itensDetalhe.forEach(item => item.hidden = item !== escolhido);
  vistaDetalhe.hidden = !temDetalhe;
  vistaLista.hidden = temDetalhe;
  window.scrollTo(0, 0);
}

/* corre ao abrir a página e sempre que o #… do endereço muda */
window.addEventListener("hashchange", mostrarVista);
mostrarVista();

/* o browser salta para o #item-N depois de carregar; voltamos ao topo da página */
window.addEventListener("load", () => setTimeout(() => window.scrollTo(0, 0), 50));
