import { normalMode, stopGame } from '../game_mode/normal/main.js';

export class NormalGamePage {
	constructor(themeReceived, type, socketTournament, infoMatch) {
		this.theme = themeReceived
		this.container = document.getElementById('dynamicPage');
		this.type = type;
		this.socketTournament = socketTournament;
		this.infoMatch = infoMatch;
		this.game = null;
		this.pause = false;
	}

	async handle() {
		this.setupEventListeners()
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
		this.game = normalMode(this.type, this.socketTournament, this.infoMatch);
	}

	setupEventListeners()
	{
		this.keydownHandler = (e) => {
			e.preventDefault();
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
		stopGame();
		return ;
	}
}

/*

	This is exactly the same thing than the HomePage

	but this time we are adding the run of the normalMode() game:

*/
