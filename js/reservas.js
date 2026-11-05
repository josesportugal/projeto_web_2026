/* ==========================================================
   RESERVAS: calendário interativo, horas, resumo e validação
   ========================================================== */

/* Formata um preço: 18 -> "18 €" */
function formatarPreco(valor) {
  return valor + " €";
}

const HORAS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const NOMES_MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const NOMES_DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);
const amanha = new Date(hoje);
amanha.setDate(amanha.getDate() + 1);

let mesVisivel = new Date(amanha.getFullYear(), amanha.getMonth(), 1);
let dataEscolhida = null;   // objeto Date
let horaEscolhida = null;   // texto, ex.: "10:00"

/* Elementos da página */
const form = document.getElementById("form-reserva");
const inputData = document.getElementById("data");
const zonaCalendario = document.getElementById("cal-dias");
const tituloMes = document.getElementById("cal-titulo");
const botaoAnt = document.getElementById("cal-anterior");
const botaoSeg = document.getElementById("cal-seguinte");
const zonaHoras = document.getElementById("horas");

/* ---------- Funções auxiliares ---------- */
function dataParaTexto(d) {           // Date -> "2026-11-05" (formato do input date)
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mes + "-" + dia;
}
function textoParaData(t) {           // "2026-11-05" -> Date
  const partes = t.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}
function formatarDataPT(d) {
  return d.getDate() + " de " + NOMES_MESES[d.getMonth()] + " de " + d.getFullYear();
}

/* Simula horas ocupadas: o resultado é sempre o mesmo para a mesma data+hora */
function horaOcupada(data, hora) {
  const texto = dataParaTexto(data) + hora;
  let soma = 0;
  for (let i = 0; i < texto.length; i++) soma += texto.charCodeAt(i) * (i + 3);
  return soma % 100 < 35;             // cerca de 35% das horas ocupadas
}
function horasLivres(data) {
  return HORAS.filter(h => !horaOcupada(data, h)).length;
}
function diaFechado(data) {
  return data.getDay() === 0;         // domingo
}

/* ---------- Calendário ---------- */
function desenharCalendario() {
  tituloMes.textContent = NOMES_MESES[mesVisivel.getMonth()] + " " + mesVisivel.getFullYear();
  /* não deixa recuar para meses anteriores ao atual */
  botaoAnt.disabled = mesVisivel <= new Date(amanha.getFullYear(), amanha.getMonth(), 1);

  let html = NOMES_DIAS.map(d => `<div class="dia-semana">${d}</div>`).join("");

  const primeiroDia = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1);
  const diasNoMes = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 0).getDate();
  const deslocamento = (primeiroDia.getDay() + 6) % 7;   // semana começa à segunda

  for (let i = 0; i < deslocamento; i++) html += `<div class="cal-vazio"></div>`;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), dia);
    const passado = data < amanha;
    const fechado = diaFechado(data);
    const livres = horasLivres(data);
    let classes = "cal-dia";
    if (livres === 0) classes += " lotado";
    else if (livres <= 3) classes += " poucos";
    if (dataEscolhida && dataParaTexto(data) === dataParaTexto(dataEscolhida)) classes += " selecionado";
    const desativado = passado || fechado || livres === 0;
    html += `<button type="button" class="${classes}" data-data="${dataParaTexto(data)}" ${desativado ? "disabled" : ""}
              aria-label="${formatarDataPT(data)}${fechado ? ", fechado" : ""}">${dia}</button>`;
  }
  zonaCalendario.innerHTML = html;
}

function desenharHoras() {
  if (!dataEscolhida) {
    zonaHoras.innerHTML = `<p class="subtitulo" style="grid-column:1/-1">Escolhe primeiro um dia no calendário.</p>`;
    return;
  }
  zonaHoras.innerHTML = HORAS.map(function (h) {
    const ocupada = horaOcupada(dataEscolhida, h);
    const sel = h === horaEscolhida ? " selecionada" : "";
    return `<button type="button" class="hora${sel}" data-hora="${h}" ${ocupada ? "disabled" : ""}>${h}</button>`;
  }).join("");
}

function escolherData(data) {
  dataEscolhida = data;
  inputData.value = dataParaTexto(data);
  /* se a hora escolhida ficou ocupada neste novo dia, limpa-a */
  if (horaEscolhida && horaOcupada(data, horaEscolhida)) horaEscolhida = null;
  desenharCalendario();
  desenharHoras();
  limparErro("data"); limparErro("hora");
  atualizarResumo();
}

zonaCalendario.addEventListener("click", function (e) {
  const botao = e.target.closest(".cal-dia");
  if (botao && !botao.disabled) escolherData(textoParaData(botao.dataset.data));
});
zonaHoras.addEventListener("click", function (e) {
  const botao = e.target.closest(".hora");
  if (botao && !botao.disabled) {
    horaEscolhida = botao.dataset.hora;
    desenharHoras();
    limparErro("hora");
    atualizarResumo();
  }
});
botaoAnt.addEventListener("click", function () {
  mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1);
  desenharCalendario();
});
botaoSeg.addEventListener("click", function () {
  mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1);
  desenharCalendario();
});

/* Escrever a data no campo de data também atualiza o calendário */
inputData.min = dataParaTexto(amanha);
inputData.addEventListener("change", function () {
  if (!inputData.value) return;
  const d = textoParaData(inputData.value);
  if (d >= amanha) mesVisivel = new Date(d.getFullYear(), d.getMonth(), 1);   // nunca mostra meses passados
  if (d < amanha || diaFechado(d) || horasLivres(d) === 0) {
    dataEscolhida = null;
    horaEscolhida = null;
    desenharCalendario(); desenharHoras(); atualizarResumo();
    mostrarErro("data", d < amanha ? "A data tem de ser no futuro." : "Não há horas disponíveis nesse dia.");
    return;
  }
  escolherData(d);
});

/* ---------- Serviços (caixas de seleção) ---------- */
const extraCavalo = document.getElementById("extra-cavalo");
const extraMaterial = document.getElementById("extra-material");
const selectCavalo = document.getElementById("cavalo");

function servicoMarcado(codigo) {
  return form.querySelector(`input[name="servico"][value="${codigo}"]`).checked;
}
function atualizarExtras() {
  extraCavalo.hidden = !servicoMarcado("cavalo");
  extraMaterial.hidden = !servicoMarcado("material");
}

/* ---------- Resumo da reserva ---------- */
function calcularReserva() {
  const servicosEscolhidos = [];
  let total = 0;
  /* percorre os serviços marcados; preços e nomes vêm dos atributos data-… do HTML */
  form.querySelectorAll('input[name="servico"]:checked').forEach(function (caixa) {
    let texto = caixa.dataset.nome;
    if (caixa.value === "cavalo") {
      const opcao = selectCavalo.options[selectCavalo.selectedIndex];
      total += opcao.value ? Number(opcao.dataset.preco) : Number(caixa.dataset.preco);
      if (opcao.value) texto += " (" + opcao.dataset.nome + ")";
    } else if (caixa.value === "material") {
      const itens = [...form.querySelectorAll('input[name="material"]:checked')];
      total += itens.reduce((soma, i) => soma + Number(i.dataset.preco), 0);
      if (itens.length) texto += " (" + itens.map(i => i.dataset.nome).join(", ") + ")";
    } else {
      total += Number(caixa.dataset.preco);
    }
    servicosEscolhidos.push(texto);
  });
  return { servicos: servicosEscolhidos, total: total };
}

function atualizarResumo() {
  const r = calcularReserva();
  document.getElementById("res-nome").textContent = document.getElementById("nome").value.trim() || "—";
  document.getElementById("res-data").textContent = dataEscolhida ? formatarDataPT(dataEscolhida) : "—";
  document.getElementById("res-hora").textContent = horaEscolhida || "—";
  document.getElementById("res-servicos").textContent = r.servicos.length ? r.servicos.join("; ") : "—";
  document.getElementById("res-total").textContent = formatarPreco(r.total);
}

form.addEventListener("input", atualizarResumo);
form.addEventListener("change", function () { atualizarExtras(); atualizarResumo(); });

/* ---------- Validação ---------- */
function mostrarErro(campo, mensagem) {
  const span = document.getElementById("erro-" + campo);
  if (span) span.textContent = mensagem;
  const input = document.getElementById(campo);
  if (input) input.classList.add("invalido");
}
function limparErro(campo) {
  const span = document.getElementById("erro-" + campo);
  if (span) span.textContent = "";
  const input = document.getElementById(campo);
  if (input) input.classList.remove("invalido");
}

function validar() {
  let valido = true;
  ["nome", "email", "telefone", "data", "hora", "servico"].forEach(limparErro);

  const nome = document.getElementById("nome").value.trim();
  if (nome.length < 3) { mostrarErro("nome", "Escreve o teu nome (mínimo 3 letras)."); valido = false; }

  const email = document.getElementById("email").value.trim();
  const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!padraoEmail.test(email)) { mostrarErro("email", "Escreve um e-mail válido (ex.: nome@exemplo.pt)."); valido = false; }

  const telefone = document.getElementById("telefone").value.replace(/\s/g, "");
  if (!/^(\+351)?[239]\d{8}$/.test(telefone)) { mostrarErro("telefone", "Escreve um telefone português com 9 dígitos."); valido = false; }

  if (!inputData.value) {
    mostrarErro("data", "Escolhe a data da reserva."); valido = false;
  } else if (textoParaData(inputData.value) <= hoje) {
    mostrarErro("data", "A data da reserva tem de ser no futuro."); valido = false;
  }

  if (!horaEscolhida) { mostrarErro("hora", "Escolhe uma hora disponível."); valido = false; }

  if (calcularReserva().servicos.length === 0) {
    mostrarErro("servico", "Escolhe pelo menos um serviço."); valido = false;
  } else if (servicoMarcado("material") && form.querySelectorAll('input[name="material"]:checked').length === 0) {
    mostrarErro("servico", "Escolhe pelo menos um item de material."); valido = false;
  }
  return valido;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validar()) {
    const primeiro = form.querySelector(".invalido") || document.querySelector(".erro:not(:empty)");
    if (primeiro) primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const r = calcularReserva();
  const reserva = {
    codigo: "EQ" + Date.now().toString().slice(-6),
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    data: dataParaTexto(dataEscolhida),
    hora: horaEscolhida,
    servicos: r.servicos,
    total: r.total
  };

  /* guarda no navegador (simulação – não há servidor) */
  try {
    const guardadas = JSON.parse(localStorage.getItem("equora_reservas") || "[]");
    guardadas.push(reserva);
    localStorage.setItem("equora_reservas", JSON.stringify(guardadas));
  } catch (erro) { /* se o navegador não permitir, a reserva continua simulada */ }

  document.getElementById("confirmacao-texto").textContent =
    `Obrigado, ${reserva.nome}! A tua reserva ${reserva.codigo} para ${formatarDataPT(dataEscolhida)} às ${reserva.hora} ficou registada. ` +
    `Enviaremos a confirmação para ${reserva.email}.`;
  document.getElementById("confirmacao").hidden = false;
  document.getElementById("confirmacao").scrollIntoView({ behavior: "smooth", block: "center" });
  form.reset();
  dataEscolhida = null; horaEscolhida = null;
  atualizarExtras(); desenharCalendario(); desenharHoras(); atualizarResumo();
});

/* ---------- Pré-seleção vinda das páginas de detalhe ---------- */
const params = new URLSearchParams(window.location.search);
const servicoUrl = params.get("servico");
const itemUrl = Number(params.get("item"));
if (servicoUrl && form.querySelector(`input[name="servico"][value="${servicoUrl}"]`)) {
  form.querySelector(`input[name="servico"][value="${servicoUrl}"]`).checked = true;
  if (servicoUrl === "cavalo" && itemUrl) selectCavalo.value = itemUrl;
  if (servicoUrl === "material" && itemUrl) {
    const caixa = form.querySelector(`input[name="material"][value="${itemUrl}"]`);
    if (caixa) caixa.checked = true;
  }
}

atualizarExtras();
desenharCalendario();
desenharHoras();
atualizarResumo();
