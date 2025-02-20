import { normalMode } from '../game_mode/normal/main.js';

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

		console.log("finished handle")
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
			<canvas id="pongGame" width="800" height="400"></canvas>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);
		// console.log("in render")
		this.game = normalMode(this.type, this.socketTournament, this.infoMatch);
		// console.log("after normal mode")
	}

	setupEventListeners()
	{
		this.keydownHandler = (e) => {
			e.preventDefault();
			console.log(e.key);
			if (e.key == "Escape")
			{
				if (this.pause == false && this.game) {
					this.game.stopGameLoop();
					this.game.drawPause();
					this.pause = true;
				}
				else if (this.game){
					this.pause = false;
					this.game.startGameLoop();
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

/*

	This is exactly the same thing than the HomePage

	but this time we are adding the run of the normalMode() game:

*/
