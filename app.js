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
const modal = document.getElementById('modal');
const close = document.getElementById('close');
const modalNome = document.getElementById('modalNome');
const modalHistoria = document.getElementById('modalHistoria');
const modalNivel = document.getElementById('modalNivel');
const modalXP = document.getElementById('modalXP');
const modalConquistas = document.getElementById('modalConquistas');
const addXPBtn = document.getElementById('addXPBtn');

let selectedPersonagem = null;

// Escutar mudanças em tempo real
db.ref('personagens').on('value', snapshot => {
  const data = snapshot.val();
  personagensDiv.innerHTML = '';
  for (const key in data) {
    const p = data[key];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${p.nome}</h3><img src="${p.avatar}" width="80"><p>Lv ${p.nivel}</p>`;
    card.onclick = () => openModal(key, p);
    personagensDiv.appendChild(card);
  }
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
}

// Fechar modal
close.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target === modal) modal.style.display = 'none'; }

// Adicionar XP
addXPBtn.onclick = () => {
  if(!selectedPersonagem) return;
  const ref = db.ref('personagens/' + selectedPersonagem);
  ref.transaction(p => {
    if(p) {
      p.xp += 10;
      if(p.xp >= p.nivel * 50) { // Evolução simples
        p.nivel += 1;
        p.conquistas.push('Subiu de nível!');
        p.xp = 0;
      }
    }
    return p;
  });
}
