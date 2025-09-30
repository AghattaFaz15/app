import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCxjJXRBD2OIa3w8AgFQYVSimXErFGjVc4",
  authDomain: "aplicativo-72b33.firebaseapp.com",
  databaseURL: "https://aplicativo-72b33-default-rtdb.firebaseio.com/",
  projectId: "aplicativo-72b33",
  storageBucket: "aplicativo-72b33.appspot.com",
  messagingSenderId: "968841875201",
  appId: "1:968841875201:web:08e6d443f8302367e1d500",
  measurementId: "G-6XYSJN0GFT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referências
const statusRef = ref(db, "status");
const missoesRef = ref(db, "missoes");

// Adicionar missão
window.adicionarMissao = () => {
  const texto = document.getElementById("nova-missao-texto").value;
  const xp = parseInt(document.getElementById("nova-missao-xp").value) || 5;
  if(!texto) return;
  push(missoesRef, { texto, xp, frase: `Você completou: ${texto} ✨` });
  document.getElementById("nova-missao-texto").value = '';
  document.getElementById("nova-missao-xp").value = '';
};

// Renderizar missões em tempo real
onValue(missoesRef, (snapshot)=>{
  const lista = document.getElementById("missoes");
  lista.innerHTML = "";
  snapshot.forEach(child => {
    const m = child.val();
    const li = document.createElement("li");
    li.innerHTML = `<span>${m.texto}</span> <button onclick="completarMissao('${child.key}', ${m.xp}, '${m.frase}')">✔</button>`;
    lista.appendChild(li);
  });
});

// Completar missão
window.completarMissao = (id, xp, frase) => {
  onValue(statusRef, snapshot => {
    const data = snapshot.val() || { xp:0, nivel:1, conquistas:[] };
    let novoXP = data.xp + xp;
    let nivel = data.nivel;
    let conquistas = data.conquistas || [];
    let xpParaProximoNivel = nivel * 100;

    if(novoXP >= xpParaProximoNivel){
      nivel++;
      novoXP -= xpParaProximoNivel;
      conquistas.push(`Subiu para nível ${nivel} ao completar missão`);
      alert(`✨ Parabéns! Você subiu para o nível ${nivel} ✨`);
    }
    if(frase) conquistas.push(frase);

    update(statusRef, { xp: novoXP, nivel, conquistas });
    remove(ref(db, "missoes/" + id));
  }, { onlyOnce: true });
};

// Renderizar status em tempo real
onValue(statusRef, snapshot=>{
  const data = snapshot.val() || { xp:0, nivel:1, conquistas:[] };
  document.getElementById("nivel").textContent = data.nivel;
  const xpParaProximoNivel = data.nivel * 100;
  document.getElementById("xp").textContent = data.xp;
  document.getElementById("xp-next").textContent = xpParaProximoNivel;
  document.getElementById("xp-fill").style.width = (data.xp/xpParaProximoNivel*100) + "%";

  // Conquistas
  const conquistasEl = document.getElementById("conquistas");
  conquistasEl.innerHTML = "";
  (data.conquistas||[]).forEach(c=>{
    const li = document.createElement("li");
    li.textContent = c;
    conquistasEl.appendChild(li);
  });
});
