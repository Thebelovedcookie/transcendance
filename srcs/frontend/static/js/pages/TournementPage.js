export class TournementPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.numberOfPlayers = 3;
	}

	async handle() {
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
		 <h2>TOURNAMENT</h2>
		<div id="players">
			<input class="form-control" type="text" placeholder="Player 1">
			<input class="form-control" type="text" placeholder="Player 2">
			<input class="form-control" type="text" placeholder="Player 3">
		</div>
		<div class="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
			<div class="btn-group mr-2" role="group" aria-label="First group">
				<button id="add" type="button" class="btn btn-secondary">Add Participant</button>
				<button id="play" type="button" class="btn btn-secondary">Enter</button>
				<button id="remove" type="button" class="btn btn-secondary">Remove Participant</button>
			</div>
		</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		this.managePage();
	}

	managePage()
	{
		const addButton = document.getElementById('add');
		addButton.addEventListener('click', (event) => {
			if (this.numberOfPlayers < 8)
			{
				const addFormPlayer = document.getElementById('players');
				this.numberOfPlayers++;
				console.log(this.numberOfPlayers);
				addFormPlayer.innerHTML += `<input class="form-control" type="text" placeholder="Player ${this.numberOfPlayers}">`;
			}
		});
		// const enterButton = document.getElementById('play');
		// enterButton.addEventListener('click', function(event) {

		// });

		const removeButton = document.getElementById('remove');
		removeButton.addEventListener('click', (event) => {
			if (this.numberOfPlayers > 3) {
				const addFormPlayer = document.getElementById('players');
				addFormPlayer.innerHTML = addFormPlayer.innerHTML.replace(`<input class="form-control" type="text" placeholder="Player ${this.numberOfPlayers}">`, '');
				this.numberOfPlayers--;
				console.log(this.numberOfPlayers);
			}
		});
	}
}
