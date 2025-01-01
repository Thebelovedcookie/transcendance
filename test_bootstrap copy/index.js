import { injectNavbar } from "./nav_bar.js";
// import { loop } from "./main.js";

const style = document.createElement('style');
style.textContent = `
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: white;
    }
    canvas {
        display: block;
        background-color: black;
    }
`;
document.head.appendChild(style);

//ajout de la navbar
function navBar()
{
    const content = document.getElementById('dynamicPage');
    content.innerHTML = `<div id="navbar"></div>`;
    const contentnavbar = document.getElementById('navbar');
    contentnavbar.innerHTML = injectNavbar(); 
}
navBar();

//ajout de la page Dynamic
function gamePage()
{
    const content = document.getElementById('dynamicPage');
    content.innerHTML += `<div id="pageDynamic"></div>`;
}
gamePage();


function resetCanvas() {
    const canvas = document.getElementById('pongGame');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height); // Efface le canvas
}

function initGamePage()
{
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `
    <div class="container text-start" style="position: absolute; center: 0px; width: 100px;">
            <button id="start" type="button" class="btn btn-outline-secondary">Start</button>
    </div>
    `;

    document.getElementById('start').addEventListener('click', function(event) {
        event.preventDefault();
        initGame();  // Affiche le jeu Pong
    });
}

let test = false;

function initGame() {
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `<canvas id="pongGame"></canvas>
        <script type="module" src="key_movement.js"></script>
        <script type="module" src="main.js?cachebuster=${Date.now()}"></script>
    `;

    resetCanvas();

    if (test == true)
    {
        
        window.requestAnimationFrame(module.loop);
    }
    else {
    import("./main.js").then(module => {
        test = true;
        module.resetGame(); // Réinitialise le jeu si la fonction existe
        window.requestAnimationFrame(module.loop);
    });}

    document.getElementById('homeLink').addEventListener('click', function(event) {
        event.preventDefault();
        
        showHome();
    });
    // window.requestAnimationFrame(loop);
}

// Fonction pour afficher la page d'accueil
function showHome() {
    const content = document.getElementById('pageDynamic');
    content.innerHTML = `
        <h1>Welcome to PongSite</h1>
        <p>This is a demo of dynamic content loading.</p>
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