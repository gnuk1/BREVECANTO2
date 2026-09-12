let BRANI = {}, TESTI = {}, GLOSSARI = {};

async function caricaDati() {
  BRANI = await fetch("./data/brani.json").then(r => r.json());
  TESTI = await fetch("./data/testi.json").then(r => r.json());
  GLOSSARI = await fetch("./data/glossari.json").then(r => r.json());

  renderBrani();
  renderTesti();
  renderContesto();
  mostraSchermata("home");
}

caricaDati();

let currentBranoId = null;
let currentAudio = "";
let fumettoVisibile = false;

let audioPlayer = document.getElementById("audioPlayer");

function mostraSchermata(id) {
  stopVideo();
  chiudiFumetto();
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = screen.id === id ? "block" : "none";
  });
}

function playAudio(src) {
  if (audioPlayer.src.split("/").pop() !== src.split("/").pop()) {
    audioPlayer.src = src;
  }
  audioPlayer.play();
}

function pausaAudio() {
  audioPlayer.pause();
}

function stopAudio() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}

function avantiAudio() {
  audioPlayer.currentTime += 5;
}

function indietroAudio() {
  audioPlayer.currentTime -= 5;
}

function playVideo(src) {
  const video = document.getElementById("videoPlayer");
  video.src = src;
  video.currentTime = 0;
  video.play();
}

function stopVideo() {
  const video = document.getElementById("videoPlayer");
  video.pause();
  video.currentTime = 0;
  video.removeAttribute("src");
  video.load();
}

function renderBrani() {
  const lista = document.getElementById("listaBrani");
  lista.innerHTML = "";

  Object.values(BRANI).forEach(b => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${b.titolo}</strong><br>
      <button onclick="apriAudio(${b.id})">Audio</button>
      <button onclick="apriVideo(${b.id})">Video</button>
      <button onclick="apriTesto(${b.id})">Testo</button>
    `;
    lista.appendChild(div);
  });
}

function renderTesti() {
  const lista = document.getElementById("listaTesti");
  lista.innerHTML = "";

  Object.entries(TESTI).forEach(([id, t]) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${t.titolo}</strong><br>
      <button onclick="apriTesto(${id})">Apri testo</button>
    `;
    lista.appendChild(div);
  });
}

function apriAudio(id) {
  currentBranoId = id;
  const brano = BRANI[id];

  document.getElementById("titoloAudio").innerText = brano.titolo;
  mostraSchermata("audio");

  const nomeFile = brano.audio.split("/").pop();
  const urlAudio = "https://brevecanto.netlify.app/audio/" + nomeFile;

  currentAudio = urlAudio;
  audioPlayer.src = urlAudio;
  audioPlayer.currentTime = 0;

  // ⭐ AUTOPLAY RIMOSSO
  // audioPlayer.play();
}

function apriVideo(id) {
  currentBranoId = id;
  const brano = BRANI[id];

  document.getElementById("titoloVideo").innerText = brano.titolo;
  mostraSchermata("video");
  stopAudio();

  const nomeFile = brano.video.split("/").pop();
  const urlVideo = "https://brevecanto.netlify.app/video/" + nomeFile;

  const video = document.getElementById("videoPlayer");
  video.src = urlVideo;
  video.currentTime = 0;
}

function apriTesto(id) {
  currentBranoId = id;
  const testo = TESTI[id];
  const gloss = GLOSSARI[id];

  document.getElementById("titoloTesto").innerText = testo.titolo;

  let contenuto = testo.contenuto.replace(/\n/g, "<br>");

  if (gloss && gloss.voci) {
    gloss.voci.forEach(voce => {
      const parola = voce.parola.replace(/’/g, "'");
      const spiegazione = voce.spiegazione;

      const escaped = parola.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");

      contenuto = contenuto.replace(
        regex,
        `<span class="linkParola" data-parola="${parola}" data-spiegazione="${spiegazione}">${parola}</span>`
      );
    });
  }

  const box = document.getElementById("contenutoTesto");
  box.innerHTML = contenuto;

  chiudiFumetto();

  document.querySelectorAll(".linkParola").forEach(el => {
    el.addEventListener("click", ev => {
      mostraFumetto(el.dataset.parola, el.dataset.spiegazione, ev);
    });
  });

  mostraSchermata("testoBrano");
}

function mostraFumetto(parola, spiegazione, ev) {
  const fumetto = document.getElementById("fumetto");

  if (fumettoVisibile) return chiudiFumetto();

  fumetto.innerHTML = `<strong>${parola}</strong><br>${spiegazione}`;
  fumetto.style.display = "block";

  const rect = ev.target.getBoundingClientRect();
  fumetto.style.left = rect.left + "px";
  fumetto.style.top = rect.bottom + window.scrollY + 8 + "px";

  fumettoVisibile = true;
}

function chiudiFumetto() {
  const fumetto = document.getElementById("fumetto");
  fumetto.style.display = "none";
  fumettoVisibile = false;
}

function apriGlossario(id) {
  const gloss = GLOSSARI[id];
  const lista = document.getElementById("listaGlossario");

  lista.innerHTML = gloss && gloss.voci
    ? gloss.voci.map(v => `<p><strong>${v.parola}</strong>: ${v.spiegazione}</p>`).join("")
    : "<p>Nessun glossario disponibile.</p>";

  mostraSchermata("glossario");
}

function renderContesto() {
  document.getElementById("contenutoContesto").innerHTML = `
    <p>Testo introduttivo dell'opera.</p>
    <p><strong>Radici:</strong> Bhagavad Gita, Gesù, esperienza personale.</p>
    <p><strong>Finalità:</strong> Finalità dell'opera.</p>
    <p><strong>Dedica:</strong> Testo della dedica finale.</p>
  `;
}

function stopMedia() {
  stopAudio();
  stopVideo();
  chiudiFumetto();
}

function tornaAiBrani() {
  stopMedia();
  mostraSchermata("brani");
}

function tornaAiTesti() {
  stopMedia();
  mostraSchermata("testi");
}

function tornaAlBrano() {
  if (currentBranoId) {
    stopMedia();
    apriAudio(currentBranoId);
  }
}
