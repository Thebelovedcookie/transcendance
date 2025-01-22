

export class TournamentEndGamePage {
	constructor(winner, socket, infoMatch) {
        this.container = document.getElementById('dynamicPage');
		this.winner = winner;
		this.socketTournament = socket;
        this.infoMatch = infoMatch;
    }

    async handle() {
        this.render();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'game-container';
        gameContent.innerHTML = `
            <div class="win normal game">
            <h2>And the Winner is ... ${this.winner}</h2>
            <button id ="nextGame">
                Next Match
            </button>
        </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);

        const nextGameButton = document.getElementById('nextGame');
        nextGameButton.addEventListener('click', (event) => {
            console.log(this.winner);
            const data = {
                type: "tournament.winner",
                timestamp: Date.now(),
                start: {
                    "winner": this.winner,
                }
		    };
	
            if (this.socketTournament) {
                this.socketTournament.send(JSON.stringify(data));
            } else {
                console.warn("WebSocket not connected");
            }
        })
    }
}