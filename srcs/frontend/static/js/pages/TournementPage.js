import { normalMode } from '../game_mode/normal/main.js';

export class TournementPage {
	constructor(themeReceived) {
		this.theme = themeReceived
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
			<section class="gradient-custom">
				<div class="container py-5 h-100">
					<div class="row d-flex justify-content-center align-items-center h-100">
						<div class="col-12 col-md-8 col-lg-6 col-xl-5">
							<div class="card bg-dark text-white" style="border-radius: 1rem;">
								<div class="card-body p-5 text-center">
									<div class="mb-md-5 mt-md-4 pb-5">
										<h2 class="fw-bold mb-2 text-uppercase">Tournement</h2>
										<p class="text-white-50 mb-5">Please enter the number of players</p>
										<div data-mdb-input-init class="form-outline form-white mb-4">
												<input type="number" id="numberOfPlayer" class="form-control form-control-lg" min="3" max="8" />
												<button data-mdb-button-init data-mdb-ripple-init class="btn btn-outline-light btn-lg px-5" type="submit" id="PlayerForm">Enter</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		this.initListeners();
	}

	initListeners() {
		const button = document.getElementById('PlayerForm');
		button.addEventListener('click', function(event) {
			event.preventDefault();

			const playerCount = document.getElementById("numberOfPlayer").value;

				console.log(playerCount);
			new Tournement(playerCount);
		});
	}
}

class Tournement {
	constructor(numberOfPlayer) {
		this.players = numberOfPlayer;
		this.namesOfPlayer = [];
	}

	addPlayer(name) {
		if (this.namesOfPlayer.length < this.players) {
			this.namesOfPlayer.push({ name: name, matchesWon: 0 });
			console.log(`Joueur ajouté : ${name}`);
		} else {
			console.error("Nombre maximum de joueurs atteint.");
		}
	}

	updateWins(playerName) {
		const player = this.namesOfPlayer.find(p => p.name === playerName);
		if (player) {
			player.matchesWon += 1;
			console.log(`${playerName} a maintenant ${player.matchesWon} victoire(s).`);
		} else {
			console.error("Joueur introuvable.");
		}
	}

	displayPlayers() {
		console.log("Liste des joueurs :");
		this.namesOfPlayer.forEach(player => {
			console.log(`Nom : ${player.name}, Victoires : ${player.matchesWon}`);
		});
	}
}
