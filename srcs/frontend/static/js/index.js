import { normalMode, stopGameNormal } from "./game_mode/normal/main.js";
import { soloMode, stopGameSolo } from "./game_mode/solo/main_solo.js";

//ajout de la page Dynamic
function gamePage()
{
    const content = document.getElementById('dynamicPage');
    content.innerHTML += `<div id="pageDynamic"></div>`;
}
gamePage();

function initGamePage()
{
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `
    <div class="d-flex flex-column align-items-start" style="gap: 10px; width: 150px;">
    <button id="normal" type="button" class="btn btn-outline-secondary">Mode Normal</button>
    <button id="solo" type="button" class="btn btn-outline-secondary">Mode Solo</button>
    <button id="tournement" type="button" class="btn btn-outline-secondary">Tournament</button>
    </div>
    `;


    //button normal mode
    document.getElementById('normal').addEventListener('click', function(event) {
        event.preventDefault();
        initNormalGame();  // Affiche le jeu Pong
    });

    //botton solo mode
    document.getElementById('solo').addEventListener('click', function(event) {
        event.preventDefault();
        initSoloGame();
    });

    document.getElementById('tournement').addEventListener('click', function(event) {
        event.preventDefault();
        initNormalGame();  // Affiche le jeu Pong
    });

}

//mode de jeux solo
function initSoloGame() {
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `<canvas class="bla" id="pongGame"></canvas>
        <script type="module" src="./game_mode/solo/key_movement_solo.js"></script>
        <script type="module" src="./game_mode/solo/main_solo.js?cachebuster=${Date.now()}"></script>
    `;

    soloMode();
    document.getElementById('homeLink').addEventListener('click', function(event) {
        event.preventDefault();
        stopGameSolo();
        showHome();
    });
}

//mode de jeu normal
function initNormalGame() {
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `<canvas class="bla" id="pongGame"></canvas>
        <script type="module" src="./game_mode/normal/key_movement.js"></script>
        <script type="module" src="./game_mode/normal/main.js?cachebuster=${Date.now()}"></script>
    `;

    normalMode();
    document.getElementById('homeLink').addEventListener('click', function(event) {
        event.preventDefault();
        stopGameNormal();
        showHome();
    });
}

// Fonction pour afficher la page d'accueil
function showHome() {
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `
        <h1 style="color: gray;">Welcome to PongSite</h1>

    `;

    document.getElementById('gameLink').addEventListener('click', function(event) {
        event.preventDefault();
        initGamePage();
    });

    document.getElementById('homeLink').addEventListener('click', function(event) {
        event.preventDefault();
        showHome();
    });
};


showHome(); // Appel initial pour afficher la page d'accueil
