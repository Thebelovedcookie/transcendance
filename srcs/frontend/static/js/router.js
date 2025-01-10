"use strict";

import { normalMode, stopGameNormal } from "./game_mode/normal/main.js";
import { soloMode, stopGameSolo } from "./game_mode/solo/main_solo.js";

class Router {
    constructor() {
        this.routes = new Map();
        this.container = document.getElementById('dynamicPage');

        this.initializeRoutes();
        this.setupEventListeners();
        this.handleLocation();
    }

    initializeRoutes() {
        this.routes.set('/', this.handleHome.bind(this));
        this.routes.set('/pong', this.handlePong.bind(this));
        this.routes.set('/pong/normal', this.handleNormalGame.bind(this));
        this.routes.set('/pong/solo', this.handleSoloGame.bind(this));
    }

    setupEventListeners() {
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-path]');
            if (target) {
                e.preventDefault();
                const path = target.getAttribute('data-path');
                this.navigateTo(path);
            }
        });
    }

    async handleLocation() {
        const path = window.location.pathname;
        const handler = this.routes.get(path);

        if (handler) {
            await handler();
        } else {
            console.error('404: Page not found');
            this.renderNotFound();
        }
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleLocation();
    }

    // Route handlers
    async handleHome() {
        stopGameNormal();
        stopGameSolo();
        this.renderHome();
    }

    async handlePong() {
        stopGameNormal();
        stopGameSolo();
        this.renderPongMenu();
    }

    async handleNormalGame() {
        stopGameSolo();
        this.renderNormalGame();
        normalMode();
    }

    async handleSoloGame() {
        stopGameNormal();
        this.renderSoloGame();
        soloMode();
    }

    // Render methods
    renderHome() {
        const homeContent = document.createElement('div');
        homeContent.innerHTML = `
            <h1>Welcome to the home page</h1>
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 text-center">
                        <a href="/pong" data-path="/pong" class="btn btn-primary btn-lg pong-btn">
                            <i class="bi bi-controller me-2"></i>
                            Start Game
                        </a>
                        <p class="mt-3 text-muted">Click to play Pong!</p>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(homeContent);
    }

    renderPongMenu() {
        const menuContent = document.createElement('div');
        menuContent.className = 'pong-menu';

        const title = document.createElement('h2');
        title.textContent = 'Select Game Mode';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const normalButton = document.createElement('button');
        normalButton.textContent = 'Normal Mode';
        normalButton.addEventListener('click', () => this.navigateTo('/pong/normal'));

        const soloButton = document.createElement('button');
        soloButton.textContent = 'Solo Mode';
        soloButton.addEventListener('click', () => this.navigateTo('/pong/solo'));

        buttonContainer.appendChild(normalButton);
        buttonContainer.appendChild(soloButton);

        menuContent.appendChild(title);
        menuContent.appendChild(buttonContainer);

        this.container.innerHTML = '';
        this.container.appendChild(menuContent);
    }

    renderNormalGame() {
        const gameContent = document.createElement('div');
        gameContent.className = 'game-container';

        const canvas = document.createElement('canvas');
        canvas.id = 'pongGame';
        canvas.width = 800;
        canvas.height = 400;

        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'score-board';
        scoreBoard.innerHTML = `
            <div class="player1-score">Player 1: <span>0</span></div>
            <div class="player2-score">Player 2: <span>0</span></div>
        `;

        gameContent.appendChild(scoreBoard);
        gameContent.appendChild(canvas);

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
    }

    renderSoloGame() {
        const gameContent = document.createElement('div');
        gameContent.className = 'game-container';

        const canvas = document.createElement('canvas');
        canvas.id = 'pongGame';
        canvas.width = 800;
        canvas.height = 400;

        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'score-board';
        scoreBoard.innerHTML = `
            <div class="player-score">Score: <span>0</span></div>
            <div class="high-score">High Score: <span>0</span></div>
        `;

        gameContent.appendChild(scoreBoard);
        gameContent.appendChild(canvas);

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
    }

    renderNotFound() {
        const notFoundContent = document.createElement('div');
        notFoundContent.className = 'not-found';

        const title = document.createElement('h1');
        title.textContent = '404 - Page Not Found';

        const message = document.createElement('p');
        message.textContent = 'The page you are looking for does not exist.';

        const backButton = document.createElement('button');
        backButton.textContent = 'Go Home';
        backButton.addEventListener('click', () => this.navigateTo('/'));

        notFoundContent.appendChild(title);
        notFoundContent.appendChild(message);
        notFoundContent.appendChild(backButton);

        this.container.innerHTML = '';
        this.container.appendChild(notFoundContent);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Router();
});
