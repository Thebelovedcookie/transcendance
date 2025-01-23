export class EndTournementPage {
	constructor(winner) {
        this.container = document.getElementById('dynamicPage');
		this.winner = winner;
    }

    async handle() {
        this.render();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'game-container';
        gameContent.innerHTML = `
            <div class="win normal game">
            <h2>And the Winner of the tournement is ... ${this.winner}</h2>
			<a href="/pong" data-path="/pong" class="play-btn">
				return
			</a>
        </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
    }
}