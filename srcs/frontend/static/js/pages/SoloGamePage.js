import { soloMode, paused, loopSolo, drawPause } from '../game_mode/solo/main_solo.js';

export class SoloGamePage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
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

		soloMode();
	}

	setupEventListeners()
	{
		window.addEventListener('keydown', (e) => {
			e.preventDefault();
			console.log(e.key);
			if (e.key == "Escape")
			{
				if (this.pause == false) {
					paused();
					drawPause();
					this.pause = true;
				}
				else {
					this.pause = false;
					loopSolo();
				}

			}
		})
	}
}

/*

	This is exactly the same thing than the HomePage

	but this time we are adding the run of the SoloMode game:

*/
