export class PongMenuPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	showSoloModeModal() {
		const modal = document.createElement('div');
		modal.className = 'game-mode-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2>Select Solo Mode Type</h2>
				<div class="modal-options">
					<div class="modal-option" data-path="/pong/solo">
						<div class="option-icon">🎯</div>
						<h3>Practice Mode</h3>
						<p>Train your skills without pressure</p>
					</div>
					<div class="modal-option" data-path="/pong/solo/ai">
						<div class="option-icon">🤖</div>
						<h3>VS AI Mode</h3>
						<p>Challenge our AI opponent</p>
					</div>
				</div>
				<button class="modal-close">×</button>
			</div>
		`;

		document.body.appendChild(modal);

		// Close modal when clicking outside or on close button
		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.className === 'modal-close') {
				modal.remove();
			}
		});

		// Handle option selection
		const options = modal.querySelectorAll('.modal-option');
		options.forEach(option => {
			option.addEventListener('click', () => {
				modal.remove();
			});
		});
	}

	async handle() {
		this.render();
	}

	render() {
		const menuContent = document.createElement('div');
		menuContent.innerHTML = `
			<div class="pong-menu-container">
				<div class="game-title">
					<h1>PONG</h1>
					<p class="subtitle" data-translate= "modeSelect"></p>
				</div>

                <div class="game-modes">
                    <div class="mode-card" data-path="/pong/remote">
                        <div class="mode-icon">🏓</div>
                        <h3 data-translate="Normal Mode"></h3>
                        <p data-translate="Classic1"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>
                    <div class="mode-card" data-path="/pong/normal">
                        <div class="mode-icon">🏓🏓</div>
                        <h3 data-translate="Normal Mode"></h3>
                        <p data-translate="Classic2"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>
                    <div class="mode-card" data-path="/pong/multi">
                        <div class="mode-icon">🏓🏓🏓</div>
                        <h3 data-translate ="MultiMode"></h3>
                        <p data-translate = "Multidetails"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>

					<div class="mode-card solo-mode">
						<div class="mode-icon">🤖</div>
						<h3 data-translate = "Solo"></h3>
						<p data-translate = "Solodetails">/p>
						<div class="mode-hover" data-translate="PLAY"></div>
					</div>

					<div class="mode-card" data-path="/pong/tournament">
						<div class="mode-icon">🏆</div>
						<h3 data-translate="Tournament"></h3>
						<p data-translate="Tournamentdetails"></p>
						<div class="mode-hover"data-translate="PLAY"></div>
					</div>
				</div>
			</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(menuContent);

		// Add click event listeners to cards
		const cards = document.querySelectorAll('.mode-card');
		cards.forEach(card => {
			card.addEventListener('click', () => {
				if (card.classList.contains('solo-mode')) {
					this.showSoloModeModal();
				}
			});
		});
	}
}

/*

	This is exactly the same thing than the HomePage

	but this time we are sending the PongMenuPage

*/
