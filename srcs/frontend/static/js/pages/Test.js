import { startGame } from '../test/test1.js';


export class Test {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        this.render();
    }

    render() {
        const homeContent = document.createElement('div');
        homeContent.innerHTML = `
            <canvas id="pongGame" width="800" height="400"></canvas>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(homeContent);
		
		startGame();
    }
}
