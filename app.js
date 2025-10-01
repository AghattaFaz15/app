// ==========================
// DADOS INICIAIS
// ==========================
const DADOS_INICIAIS = {
  jogador: { nome: "⚔️ Guerreiro do Eterno ⚔️", nivel: 1, xp: 0, ultimaData: new Date().toDateString() },
  niveis: [
    { nivel: 1, xpNecessario: 200, titulo: "Aprendiz da Luz" },
    { nivel: 2, xpNecessario: 400, titulo: "Guardião da Palavra" },
    { nivel: 3, xpNecessario: 600, titulo: "Discípulo Firme" },
    { nivel: 4, xpNecessario: 800, titulo: "Servo da Verdade" },
    { nivel: 5, xpNecessario: 1000, titulo: "Atalaia do Reino" },
    { nivel: 6, xpNecessario: 1200, titulo: "Guerreiro da Fé" },
    { nivel: 7, xpNecessario: 1400, titulo: "Campeão da Esperança" },
    { nivel: 8, xpNecessario: 1600, titulo: "Poeta do Altíssimo" },
    { nivel: 9, xpNecessario: 1800, titulo: "Voz Profética" },
    { nivel: 10, xpNecessario: 2000, titulo: "Embaixador da Eternidade" }
  ],
  frasesDia: [
    "A força não vem do corpo, mas do Espírito que habita em ti.",
    "O amanhã se vence com a disciplina de hoje.",
    "Matar o velho homem é mais difícil do que matar um leão.",
    "A vitória começa em pensamentos disciplinados.",
    "Quem se curva diante de Deus não se curva diante dos homens."
  ],
  missoesFixas: [
    { id: 1, texto: "Orar ao amanhecer", xp: 20, conselho: "Quem começa o dia no altar, caminha em vitória.", concluida: false },
    { id: 2, texto: "Meditar em 1 versículo", xp: 20, conselho: "Um versículo diário é uma semente eterna.", concluida: false },
    { id: 3, texto: "Beber 2L de água", xp: 20, conselho: "Água para o corpo, Palavra para a alma.", concluida: false },
    { id: 4, texto: "Cuidar do corpo com exercício", xp: 20, conselho: "O corpo é templo; fortalece-o com zelo.", concluida: false }
  ],
  missoesBanco: [
    { id: 101, texto: "Escrever uma frase poética sobre Deus", xp: 25, conselho: "Tua pena pode ser espada que inspira." },
    { id: 102, texto: "Gravar um vídeo cantando um hino", xp: 30, conselho: "A tua voz é incenso subindo ao céu." },
    { id: 103, texto: "Ajudar alguém da família", xp: 20, conselho: "Servir aos teus é servir ao Senhor." },
    { id: 104, texto: "Anotar 3 aprendizados do dia", xp: 20, conselho: "O sábio não só vive, ele registra." },
    { id: 105, texto: "Fazer 10 minutos de silêncio e oração", xp: 20, conselho: "O silêncio é o idioma de Deus." },
    { id: 106, texto: "Ler 1 capítulo de um livro", xp: 25, conselho: "Um livro é outro mestre que te acompanha." },
    { id: 107, texto: "Escrever 1 parágrafo para teu livro", xp: 25, conselho: "Cada parágrafo é tijolo da tua obra." },
    { id: 108, texto: "Compartilhar 1 reflexão no Instagram", xp: 25, conselho: "Usa a rede como púlpito digital." },
    { id: 109, texto: "Ajudar alguém sem esperar retorno", xp: 30, conselho: "A dádiva sem interesse enche o céu de alegria." },
    { id: 110, texto: "Revisar metas e agradecer a Deus", xp: 30, conselho: "Planejamento sem gratidão é vazio." }
  ],
  missoesAtivas: []
};

let dados = {};
const uid = "tocha_unico"; // seu identificador de jogador

// ==========================
// FUNÇÕES FIREBASE
// ==========================
function salvarDadosFirebase() {
  firebase.database().ref("jogadores/" + uid).set(dados);
}

function carregarDadosFirebase() {
  firebase.database().ref("jogadores/" + uid).once("value").then(snapshot => {
    if(snapshot.exists()) {
      dados = snapshot.val();
      checarDia();
    } else {
      dados = JSON.parse(JSON.stringify(DADOS_INICIAIS));
      renovarMissoes();
    }
  });
}

// ==========================
// RESET DIÁRIO E MISSÕES
// ==========================
function checarDia() {
  const hoje = new Date().toDateString();
  if(dados.jogador.ultimaData !== hoje){
    dados.jogador.ultimaData = hoje;
    renovarMissoes();
  } else {
    renderizar();
  }
}

function renovarMissoes() {
  dados.missoesFixas.forEach(m => m.concluida = false);
  let banco = [...dados.missoesBanco];
  let aleatorias = [];
  for (let i=0; i<4; i++){
    const idx = Math.floor(Math.random()*banco.length);
    aleatorias.push(banco.splice(idx,1)[0]);
  }
  dados.missoesAtivas = [...dados.missoesFixas, ...aleatorias];
  salvarDadosFirebase();
  renderizar();
}

// ==========================
// FUNÇÕES DE MISSÕES
// ==========================
function concluirMissao(id){
  const missao = dados.missoesAtivas.find(m => m.id===id);
  if(missao && !missao.concluida){
    missao.concluida = true;
    dados.jogador.xp += missao.xp;
    verificarNivel();
    salvarDadosFirebase();
    renderizar();
  }
}

function criarMissao(){
  const texto = document.getElementById("inputMissao").value.trim();
  if(texto){
    const nova = { id: Date.now(), texto, xp: 20, conselho: "Missão criada por você!", concluida: false };
    dados.missoesAtivas.push(nova);
    salvarDadosFirebase();
    renderizar();
    document.getElementById("inputMissao").value = "";
  }
}

function excluirMissao(id){
  dados.missoesAtivas = dados.missoesAtivas.filter(m => m.id!==id);
  salvarDadosFirebase();
  renderizar();
}

function sortearOutra(){
  if(dados.missoesBanco.length>0){
    const idx = Math.floor(Math.random()*dados.missoesBanco.length);
    dados.missoesAtivas.push(dados.missoesBanco[idx]);
    salvarDadosFirebase();
    renderizar();
  }
}

// ==========================
// NÍVEL
// ==========================
function verificarNivel(){
  let nivelAtual = dados.niveis.find(n => n.nivel===dados.jogador.nivel);
  if(dados.jogador.xp >= nivelAtual.xpNecessario){
    dados.jogador.nivel++;
    alert("🎉 Subiu de nível! Agora você é: "+dados.niveis.find(n=>n.nivel===dados.jogador.nivel).titulo);
  }
}

// ==========================
// RENDERIZAÇÃO
// ==========================
function renderizar(){
  document.getElementById("nivel").innerText = dados.jogador.nivel;
  let nivelAtual = dados.niveis.find(n=>n.nivel===dados.jogador.nivel);
  document.getElementById("tituloNivel").innerText = nivelAtual.titulo;
  document.getElementById("xp").innerText = dados.jogador.xp;
  document.getElementById("xpNecessario").innerText = nivelAtual.xpNecessario;
  document.getElementById("barraXP").style.width = (dados.jogador.xp / nivelAtual.xpNecessario * 100) + "%";
  document.getElementById("fraseDia").innerText = dados.frasesDia[new Date().getDate() % dados.frasesDia.length];

  let lista = document.getElementById("listaMissoes");
  lista.innerHTML = "";
  dados.missoesAtivas.forEach(m=>{
    let li = document.createElement("li");
    li.innerHTML = `
      <span class="${m.concluida?'feito':''}">${m.texto}</span>
      <small>(${m.conselho})</small>
      <button onclick="concluirMissao(${m.id})">✔</button>
      <button onclick="excluirMissao(${m.id})">❌</button>
    `;
    lista.appendChild(li);
  });
}

// ==========================
// ONLOAD
// ==========================
window.onload = carregarDadosFirebase;
