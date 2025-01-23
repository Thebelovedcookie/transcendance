export class TournamentEndGamePage {
	constructor(winner, loser, socket, infoMatch) {
        this.container = document.getElementById('dynamicPage');
		this.winner = winner;
        this.loser = loser;
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

        const nextGameButton1 = document.getElementById('nextGame');
        nextGameButton1.addEventListener('click', (event) => {
            console.log(this.winner);
            const data = {
                type: "tournament.winner",
                timestamp: Date.now(),
                start: {
                    "winner": this.winner,
                    "loser": this.loser,
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