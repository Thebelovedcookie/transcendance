export class SettingPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.settings = {
			language: localStorage.getItem('selectedLang') || 'en',
			mode: localStorage.getItem('displayMode') || 'light'
		};
		this.languages = [
			{ code: 'en', name: 'English', icon: '🇬🇧' },
			{ code: 'fr', name: 'Français', icon: '🇫🇷' },
			{ code: 'ja', name: '日本語', icon: '🇯🇵' },
			{ code: 'es', name: 'Spanish', icon: '🇫🇷' }
		];
	}

	async handle() {
		this.render();
		this.setupEventListeners();
	}

	render() {
		const content = `
			<div class="settings-container">
				<h1 class="settings-title" data-translate="Settings">Settings</h1>

				<div class="settings-section">
					<h2 data-translate="language">Language</h2>
					<div class="language-options">
						${this.languages.map(lang => `
							<div class="language-option ${this.settings.language === lang.code ? 'active' : ''}"
								 data-lang="${lang.code}">
								<span class="language-icon">${lang.icon}</span>
								<span class="language-name">${lang.name}</span>
							</div>
						`).join('')}
					</div>
				</div>

				<div class="settings-section danger-zone">
					<h2 data-translate = "AccountManagement">Account Management</h2>
					<p class="warning-text" data-translate="AccountManagementError">Warning: This action cannot be undone.</p>
					<button class="delete-account-btn" data-translate="DeleteAccount">Delete Account</button>
				</div>
			</div>
		`;
		this.container.innerHTML = content;
	}

	setupEventListeners() {
		// Display mode
		document.querySelectorAll('.mode-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const mode = btn.dataset.mode;
				this.updateDisplayMode(mode);
			});
		});

		// Language selection
		document.querySelectorAll('.language-option').forEach(option => {
			option.addEventListener('click', () => {
				const lang = option.dataset.lang;
				this.updateLanguage(lang);
			});
		});

		// Delete account
		const deleteBtn = document.querySelector('.delete-account-btn');
		deleteBtn.addEventListener('click', () => this.showDeleteConfirmation());
	}

	async updateLanguage(lang) {
		this.settings.language = lang;
		localStorage.setItem('selectedLang', lang);
		await updateTexts(lang);
		document.querySelectorAll('.language-option').forEach(option => {
			option.classList.toggle('active', option.dataset.lang === lang);
		});
	}

	showDeleteConfirmation() {
		const modal = document.createElement('div');
		modal.className = 'confirmation-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="DeleteAccount">Delete Account</h2>
				<p data-translate = "DeleteAccountMessage" >Are you sure you want to delete your account? This action cannot be undone.</p>
				<div class="modal-actions">
					<button class="cancel-btn" data-translate="cancel">Cancel</button>
					<button class="delete-btn" data-translate="DeleteAccount">Delete Account</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		const cancelBtn = modal.querySelector('.cancel-btn');
		const deleteBtn = modal.querySelector('.delete-btn');

		cancelBtn.addEventListener('click', () => {
			modal.remove();
		});

		deleteBtn.addEventListener('click', () => {
			// Here you would typically make an API call to delete the account
			modal.remove();
			// Redirect to logout or home page
			window.location.href = '/';
		});
	}

	clean() {
		return ;
	}
}
