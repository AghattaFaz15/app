// ----- Dados iniciais -----
let status = JSON.parse(localStorage.getItem('status')) || { nivel:1, xp:0, conquistas:[] };

const missoesFixas = [
  {id:1, texto:"Oração matinal", xp:10},
  {id:2, texto:"Leitura da Bíblia", xp:15},
  {id:3, texto:"Ajudar alguém da família", xp:10},
  {id:4, texto:"Reflexão ou meditação", xp:10}
];

// Gerar missões alteráveis aleatórias
function gerarMissoesAlteraveis(){
  const aleatorias = [
    {id:101, texto:"Exercício físico", xp:5},
    {id:102, texto:"Aprender algo novo", xp:10},
    {id:103, texto:"Organizar algo da casa", xp:5},
    {id:104, texto:"Escrever diário ou gratidão", xp:8}
  ];
  return aleatorias.sort(()=>0.5-Math.random()).slice(0,2); // pegar 2 aleatórias
}

let missoes = [...missoesFixas, ...gerarMissoesAlteraveis()];

// ----- Funções -----
function salvar(){
  localStorage.setItem('status', JSON.stringify(status));
}

function atualizarTela(){
  document.getElementById("nivel").textContent = status.nivel;
  document.getElementById("xp").textContent = status.xp;
  document.getElementById("xp-fill").style.width = status.xp + "%";

  // conquistas
  const conquistasEl = document.getElementById('conquistas');
  conquistasEl.innerHTML = "";
  status.conquistas.forEach(c=>{
    const li = document.createElement('li');
    li.textContent = c;
    conquistasEl.appendChild(li);
  });
}

function renderMissoes(){
  const lista = document.getElementById("missoes");
  lista.innerHTML = "";
  missoes.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${m.texto}</span> <button onclick="completarMissao(${m.id})">✔</button>`;
    lista.appendChild(li);
  });
}

window.completarMissao = (id)=>{
  const missao = missoes.find(m=>m.id===id);
  if(!missao) return;
  status.xp += missao.xp;
  if(status.xp >= 100){
    status.nivel++;
    status.conquistas.push(`Subiu para nível ${status.nivel} ao completar "${missao.texto}"`);
    status.xp -= 100;
  }
  missoes = missoes.filter(m=>m.id!==id); // remove missão concluída
  salvar();
  renderMissoes();
  atualizarTela();
}

// ----- Inicializar -----
renderMissoes();
atualizarTela();
