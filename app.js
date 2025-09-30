// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DOMINIO.firebaseio.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const personagensDiv = document.getElementById('personagens');
const missoesDiv = document.getElementById('missoes');
const objetivosDiv = document.getElementById('objetivos');

const modal = document.getElementById('modal');
const close = document.getElementById('close');
const modalNome = document.getElementById('modalNome');
const modalHistoria = document.getElementById('modalHistoria');
const modalNivel = document.getElementById('modalNivel');
const modalXP = document.getElementById('modalXP');
const modalConquistas = document.getElementById('modalConquistas');
const addXPBtn = document.getElementById('addXPBtn');

let selectedPersonagem = null;

// Missões diárias
const missoes = [
  {nome: "Oração matinal", xp: 10},
  {nome: "Ajudar alguém da família", xp: 15},
  {nome: "Cumprir tarefa doméstica", xp: 5},
  {nome: "Estudo espiritual", xp: 8},
  {nome: "Compartilhar luz", xp: 12}
];

// Exibir missões
function renderMissoes() {
  missoesDiv.innerHTML = '';
  missoes.forEach((m, index) => {
    const div = document.createElement('div');
    div.className = 'missao';
    div.innerHTML = `<h4>${m.nome}</h4><p>XP: ${m.xp}</p>`;
    div.onclick = () => completarMissao(selectedPersonagem, index);
    missoesDiv.appendChild(div);
  });
}

// Exibir objetivos simples
function renderObjetivos(personagensData) {
  objetivosDiv.innerHTML = '';
  for(const key in personagensData) {
    const p = personagensData[key];
    const div = document.createElement('div');
    div.className = 'objetivo';
    div.innerHTML = `<h4>${p.nome}</h4><p>Lv ${p.nivel} | XP: ${p.xp}</p><p>Conquistas: ${p.conquistas.join(', ')}</p>`;
    objetivosDiv.appendChild(div);
  }
}

// Escutar personagens em tempo real
db.ref('personagens').on('value', snapshot => {
  const data = snapshot.val() || {};
  personagensDiv.innerHTML = '';
  for(const key in data) {
    const p = data[key];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${p.nome}</h3><img src="${p.avatar}" width="80"><p>Lv ${p.nivel}</p>`;
    card.onclick = () => openModal(key, p);
    personagensDiv.appendChild(card);
  }
  renderObjetivos(data);
});

// Abrir modal
function openModal(key, personagem) {
  selectedPersonagem = key;
  modal.style.display = 'block';
  modalNome.innerText = personagem.nome;
  modalHistoria.innerText = personagem.historia;
  modalNivel.innerText = personagem.nivel;
  modalXP.innerText = personagem.xp;
  modalConquistas.innerText = personagem.conquistas.join(', ');
  renderMissoes();
}

// Fechar modal
close.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target === modal) modal.style.display = 'none'; }

// Adicionar XP diretamente
addXPBtn.onclick = () => {
  if(!selectedPersonagem) return;
  const ref = db.ref('personagens/' + selectedPersonagem);
  ref.transaction(p => {
    if(p){
      p.xp += 10;
      if(p.xp >= p.nivel * 50){
        p.nivel += 1;
        p.conquistas.push('Subiu de nível!');
        p.xp = 0;
      }
    }
    return p;
  });
}

// Completar missão
function completarMissao(personagem, missaoIndex) {
  if(!personagem) {
    alert('Selecione um personagem primeiro!');
    return;
  }
  const m = missoes[missaoIndex];
  const ref = db.ref('personagens/' + personagem);
  ref.transaction(p => {
    if(p){
      p.xp += m.xp;
      if(p.xp >= p.nivel * 50){
        p.nivel += 1;
        p.conquistas.push(`Missão "${m.nome}" completada!`);
        p.xp = 0;
      }
    }
    return p;
  });
}
