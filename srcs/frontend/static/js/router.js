"use strict";

import { HomePage } from './pages/HomePage.js';
import { PongMenuPage } from './pages/PongMenuPage.js';
import { NormalGamePage } from './pages/NormalGamePage.js';
import { SoloGamePage } from './pages/SoloGamePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.container = document.getElementById('dynamicPage');

        this.initializeRoutes();
        this.setupEventListeners();
        this.handleLocation();
    }

    initializeRoutes() {
        this.routes.set('/', new HomePage());
        this.routes.set('/pong', new PongMenuPage());
        this.routes.set('/pong/normal', new NormalGamePage());
        this.routes.set('/pong/solo', new SoloGamePage());
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
        const page = this.routes.get(path) || new NotFoundPage();
        await page.handle();
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleLocation();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Router();
});
