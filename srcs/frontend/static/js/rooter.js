"use strict";
import { normalMode, stopGameNormal } from "./game_mode/normal/main.js";
import { soloMode, stopGameSolo } from "./game_mode/solo/main_solo.js";

function initSoloGame() {
    stopGameNormal();
    soloMode();
}

//mode de jeu normal
function initNormalGame() {
    stopGameSolo();
    normalMode();
}

// Define routes and their corresponding Django URLs
const routes = {
    '/': 'home',
    '/pong':'pong',
    '/pong/normal': 'pong/normal',
    '/pong/solo': 'pong/solo',
};

// Handle route changes
async function handleLocation() {
    const path = window.location.pathname;
    const routeName = routes[path];

    try {
        const response = await fetch('/' +routeName);
        if (!response.ok) throw new Error('Page not found');

        const content = await response.text();
        document.getElementById('dynamicPage').innerHTML = content;

        if (routeName === 'pong/normal') {
            initNormalGame();
        } else if (routeName === 'pong/solo') {
            initSoloGame();
        }

        // Setup event listeners for the new content
        setupEventListeners();

    } catch (error) {
        console.error('Navigation error:', error);
        // Handle 404 or other errors
    }
}

// Route handler for link clicks
function route(event) {
    event.preventDefault();
    const path = event.target.getAttribute('data-path');

    if (path) {
        window.history.pushState({}, '', path);
        handleLocation();
    }
}

// Setup event listeners for navigation
function setupEventListeners() {
    const normalBtn = document.getElementById('normal');
    const soloBtn = document.getElementById('solo');
    const homeBtn = document.getElementById('homeLink');
    const gameBtn = document.getElementById('gameLink');
    const pongBtn = document.getElementsByClassName('pong-btn');

    if (normalBtn) {
        normalBtn.setAttribute('data-path', '/pong/normal');
        normalBtn.addEventListener('click', route);
    }

    if (soloBtn) {
        soloBtn.setAttribute('data-path', '/pong/solo');
        soloBtn.addEventListener('click', route);
    }

    if (homeBtn) {
        homeBtn.setAttribute('data-path', '/');
        homeBtn.addEventListener('click', route);
    }

    if (gameBtn) {
        gameBtn.setAttribute('data-path', '/pong');
        gameBtn.addEventListener('click', route);
    }

    if (pongBtn) {
        for (let i = 0; i < pongBtn.length; i++) {
            pongBtn[i].setAttribute('data-path', '/pong');
            pongBtn[i].addEventListener('click', route);
        }
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    handleLocation();
});

// Initial route handling
handleLocation();
