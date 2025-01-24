import { NormalGamePage } from "../pages/NormalGamePage.js";

export class NextGamePage {
    constructor(themeReceived, type, socketTournament, infoMatch) {
        this.theme = themeReceived
        this.container = document.getElementById('dynamicPage');
        this.type = type;
        this.socketTournament = socketTournament;
        this.infoMatch = infoMatch;
    }

    async handle() {
        this.render();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'page-container';
        gameContent.innerHTML = `
            <div class="prepare next game">
			<h2>prepare yourself for the next game</h2>
            <h2>player left is ${this.infoMatch.playerOne}</h2>
			<h2>player right is ${this.infoMatch.playerTwo}</h2>
            <button id ="nextGame2">
                RUN
            </button>
        </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);

		const nextGameButton = document.getElementById('nextGame2');
        nextGameButton.addEventListener('click', (event) => {
            	const newGame = new NormalGamePage(this.theme, this.type, this.socketTournament, this.infoMatch);
				newGame.handle();
		    });

    }
}
// YUKI