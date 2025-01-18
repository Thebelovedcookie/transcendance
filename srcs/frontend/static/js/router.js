//use strict?
"use strict";

//import all the files of rendering page to be able to manage everything on this pages
import { HomePage } from './pages/HomePage.js';
import { PongMenuPage } from './pages/PongMenuPage.js';
import { NormalGamePage } from './pages/NormalGamePage.js';
import { SoloGamePage } from './pages/SoloGamePage.js';
import { TournementPage } from './pages/TournementPage.js';
// import { TournementNamePage } from './pages/TournementNamePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingPage } from './pages/SettingPage.js';
import { LogoutPage } from './pages/LogoutPage.js';


//first step : Creation of a class Router which will allows to naviguates between pages and add an history
class Router {
    //constructor of the class call his 3 function
    constructor() {
        this.routes = new Map();
        this.container = document.getElementById('dynamicPage');

        this.initializeRoutes();
        this.setupEventListeners();
        this.handleLocation();
    }

    //add every path at our Container map "routes"
    initializeRoutes() {
        this.routes.set('/', new HomePage());
        this.routes.set('/pong', new PongMenuPage());
        this.routes.set('/pong/normal', new NormalGamePage("base"));
        this.routes.set('/pong/solo', new SoloGamePage());
        this.routes.set('/pong/tournement', new TournementPage());
        // this.routes.set('/pong/tournement1', new TournementNamePage());
        this.routes.set('/login', new LoginPage());
        this.routes.set('/register', new RegisterPage());
        this.routes.set('/profile', new ProfilePage());
        this.routes.set('/settings', new SettingPage());
        this.routes.set('/logout', new LogoutPage());
    }

    //add listeners popstate (backward/forward)
    //The listeners will tell us if someone clicked on the backward or forward button
    //then handleLocation function will manage to change the page.
    setupEventListeners() {
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        /*--------------------------------------------------------------------------------------*/
        //Yuki : Could you documente this section because it's not very clear for me even after research please?

        //listening to all event 'click' on the document to detext if the user clicked on an element who has the attribute "data-path"
        //  e.target.closest('[data-path]') : Recherche l'élément le plus proche de l'élément cliqué qui contient l'attribut data-path.
        //  Cela permet de détecter si l'utilisateur a cliqué sur un lien ou un bouton avec un chemin spécifié.
        //  Si un tel élément est trouvé :
        //      e.preventDefault() empêche le comportement par défaut du clic (par exemple, éviter qu'un lien ne recharge la page).
        //  target.getAttribute('data-path') récupère la valeur de l'attribut data-path, qui contient probablement l'URL
        //  ou le chemin vers lequel l'utilisateur veut naviguer.
        //  this.navigateTo(path) est appelé pour gérer la navigation dans l'application.
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-path]');
            if (target) {
                e.preventDefault();
                const path = target.getAttribute('data-path');
                this.navigateTo(path);
            }
        });

    }

    //how does it work ?
    async handleLocation() {
        const path = window.location.pathname;
        const page = this.routes.get(path) || new NotFoundPage();
        await page.handle();
    }

    //add the history
    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleLocation();
    }
    /*--------------------------------------------------------------------------------------*/
}

//waiting for all document loaded in the DOM before create a Router object.
document.addEventListener('DOMContentLoaded', () => {
    new Router();
});
