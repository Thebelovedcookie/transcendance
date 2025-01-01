import { injectNavbar } from "./nav_bar.js";

document.addEventListener('DOMContentLoaded', () => {
    // Ajouter du style
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

    
    function initGamePage()
    {
        const content = document.getElementById('pageDynamic');
        content.innerHTML = `
        <div class="container text-start" style="position: absolute; center: 0px; width: 100px;">
                <button id="start" type="button" class="btn btn-outline-secondary">Start</button>
        </div>
        `;

        document.getElementById('start').addEventListener('click', function(event) {
            event.preventDefault();  // Empêche le comportement de navigation par défaut
            initGame();  // Affiche le jeu Pong
        });
    }

    function initGame() {
        const content = document.getElementById('pageDynamic');
        content.innerHTML = `
            <canvas id="pongGame"></canvas>
            <script type="module" src="class_object.js"></script>
            <script type="module" src="key_movement.js"></script>
            <script type="module" src="style.js"></script>
            <script src="./main.js" type="module"></script>
        `;

        // Importer le module de jeu et démarrer la boucle d'animation
        import("./main.js").then(module => {
            console.log("Game module imported successfully");
            window.requestAnimationFrame(module.loop);
        });
        
        document.getElementById('homeLink').addEventListener('click', function(event) {
            event.preventDefault(); // Empêche le comportement par défaut
            import("./main.js").then(module => module.stopGame()); // Nettoie le jeu
            console.log("je stop tout");
            showHome(); // Affiche la page d'accueil
        });
    }

    // Fonction pour afficher la page d'accueil
    function showHome() {
        const content = document.getElementById('pageDynamic');
        content.innerHTML = `
            <h1>Welcome to PongSite</h1>
            <p>This is a demo of dynamic content loading.</p>
        `;
        
        // Ajouter les écouteurs d'événements
        document.getElementById('gameLink').addEventListener('click', function(event) {
            event.preventDefault();  // Empêche le comportement de navigation par défaut
            initGamePage();  // Affiche la page du jeu Pong
        });

        document.getElementById('homeLink').addEventListener('click', function(event) {
            event.preventDefault();  // Empêche le comportement de navigation par défaut
            showHome();  // Affiche la page d'accueil
        });
    };

    
    showHome(); // Appel initial pour afficher la page d'accueil
});