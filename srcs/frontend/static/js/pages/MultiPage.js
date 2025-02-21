import { multiMode } from "../game_mode/multiplayer/main_multi.js";

export class MultiPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.game = null;
		this.pause = false;
	}

	async handle() {
		this.setupEventListeners();
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
		   <canvas id="pongGame" width="800" height="400"></canvas>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		this.game = multiMode("base");
	}

	setupEventListeners() {
		this.keydownHandler = (e) => {
			e.preventDefault();
			console.log(e.key);
			if (e.key == "Escape")
			{
				if (this.pause == false && this.game) {
					this.game.stopGameLoop();
					this.pause = true;
					this.game.drawPause();
				}
				else if (this.game){
					this.pause = false;
					this.game.sendUnpause();
				}

			}
		};
		window.addEventListener('keydown', this.keydownHandler);
	}
	clean() {
		window.removeEventListener('keydown', this.keydownHandler);
		return ;
	}
}
