// ==========================
// CONFIGURAÇÃO FIREBASE
// ==========================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://aplicativo-72b33-default-rtdb.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const uid = "tocha_unico"; // identificador único do jogador

// ==========================
// VARIÁVEIS DO APP
// ==========================
let dados = {
  jogador: { xp: 0, nivel: 1, ultimaData: new Date().toDateString() },
  niveis: [],
  missoesAtivas: [],
  frasesDia: []
};

// ==========================
// CARREGAR DADOS FIREBASE
// ==========================
async function carregarDados() {
  // Carregar níveis
  const niveisSnap = await db.ref("niveis").once("value");
  dados.niveis = niveisSnap.val() || [
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
  ];

  // Carregar frases do dia
  const frasesSnap = await db.ref("frasesDia").once("value");
  dados.frasesDia = frasesSnap.val() || [
    "A força não vem do corpo, mas do Espírito que habita em ti.",
    "O amanhã se vence com a disciplina de hoje.",
    "Matar o velho homem é mais difícil do que matar um leão.",
    "A vitória começa em pensamentos disciplinados.",
    "Quem se curva diante de Deus não se curva diante dos homens."
  ];

  // Carregar status do jogador
  const statusSnap = await db.ref("status/" + uid).once("value");
  if(statusSnap.exists()){
    dados.jogador = statusSnap.val();
    checarDia();
  } else {
    salvarStatus();
    gerarMissoesDoDia();
  }
}

// ==========================
// SALVAR STATUS
// ==========================
function salvarStatus(){
  db.ref("status/" + uid).set(dados.jogador);
}

// ==========================
// RESET DIÁRIO E MISSÕES
// ==========================
async function gerarMissoesDoDia(){
  const fixasSnap = await db.ref("missoesFixas").once("value");
  const fixas = fixasSnap.val() || [];

  const aleatoriasSnap = await db.ref("missoesAleatorias").once("value");
  const banco = aleatoriasSnap.val() || [];
  let copiaBanco = [...banco];
  let aleatorias = [];

  for(let i=0;i<4 && copiaBanco.length>0;i++){
    const idx = Math.floor(Math.random()*copiaBanco.length);
    aleatorias.push(copiaBanco.splice(idx,1)[0]);
  }

  dados.missoesAtivas = [...fixas, ...aleatorias];
  dados.jogador.ultimaData = new Date().toDateString();
  salvarStatus();
  renderizar();
}

function checarDia(){
  const hoje = new Date().toDateString();
  if(dados.jogador.ultimaData !== hoje){
    gerarMissoesDoDia();
  } else {
    renderizar();
  }
}

// ==========================
// MISSÕES
// ==========================
function concluirMissao(id){
  const missao = dados.missoesAtivas.find(m=>m.id===id);
  if(missao && !missao.concluida){
    missao.concluida = true;
    dados.jogador.xp += missao.xp || 20;
    verificarNivel();
    salvarStatus();
    renderizar();
  }
}

function criarMissao(){
  const texto = document.getElementById("inputMissao").value.trim();
  if(texto){
    const nova = { id: Date.now(), texto, xp: 20, conselho: "Missão criada por você!", concluida:false };
    dados.missoesAtivas.push(nova);
    salvarStatus();
    renderizar();
    document.getElementById("inputMissao").value="";
  }
}

function excluirMissao(id){
  dados.missoesAtivas = dados.missoesAtivas.filter(m=>m.id!==id);
  salvarStatus();
  renderizar();
}

function sortearOutra(){
  db.ref("missoesAleatorias").once("value").then(snapshot=>{
    const banco = snapshot.val() || [];
    if(banco.length>0){
      const idx = Math.floor(Math.random()*banco.length);
      dados.missoesAtivas.push(banco[idx]);
      salvarStatus();
      renderizar();
    }
  });
}

// ==========================
// NÍVEL
// ==========================
function verificarNivel(){
  let nivelAtual = dados.niveis.find(n=>n.nivel===dados.jogador.nivel);
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
  
  document.getElementById("fraseDia").innerText = dados.frasesDia[Math.floor(Math.random()*dados.frasesDia.length)];

  const lista = document.getElementById("listaMissoes");
  lista.innerHTML="";
  dados.missoesAtivas.forEach(m=>{
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${m.concluida?'feito':''}">${m.texto}</span>
      <small>(${m.conselho || ""})</small>
      <button onclick="concluirMissao(${m.id})">✔</button>
      <button onclick="excluirMissao(${m.id})">❌</button>
    `;
    lista.appendChild(li);
  });
}

// ==========================
// ONLOAD
// ==========================
window.onload = carregarDados;
