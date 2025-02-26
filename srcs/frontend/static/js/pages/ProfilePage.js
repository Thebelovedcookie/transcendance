import { SafeText } from '../utils/safetext.js';

export class ProfilePage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.chartLoaded = false;
		this.userData = null;
		this.default_path = 'static/img/deer.jpg';
		this.userData = {};
		this.matchHistory = [];
		this.friends = [];
		this.chart = null;  // Add property to store chart instance
	}

	async handle() {
		await this.loadUserData();
		if (!window.Chart) {
			await this.loadChartJS();
		}
		this.render();
		this.setupEventListeners();
		this.initializeCharts();
	}

	async loadUserData() {
		try {
			const response = await fetch('/api/profile/get', {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			});

			if (!response.ok) {
				throw new Error(response.status);
			}

			const data = await response.json();
			if (data.status === 'success') {
				this.userData = data.data;
			}
		} catch (error) {
			// if 401, redirect to login page
			if (error.message === '401') {
				window.location.href = '/login';
			}
			console.error('Failed to load user data:', error);
		}
	}

	async loadChartJS() {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	render() {
		const content = `
			<div class="profile-container">
				<div class="profile-header">
					<div class="profile-info">
						<div class="profile-avatar-container">
							<img src="${this.userData.image_path || this.default_path}" alt="Profile" class="profile-avatar">
							<span class="online-status ${this.userData.is_online ? 'online' : ''}"></span>
						</div>
						<div class="profile-details">
							<h1>${SafeText.escape(this.userData.username)}</h1>
							<p>
								<span data-translate="memberdate"></span>
							 	<span> ${new Date(this.userData.join_date).toLocaleDateString()}</span>
							 </p>
							<button class="edit-profile-btn" data-translate="EditProfile">
								<i class="fas fa-edit"></i>
									Edit Profile
							</button>
						</div>
					</div>
					<div class="profile-stats">
						<div class="stat-card">
							<h3 data-translate="TotalGame"></h3>
							<p>${this.userData.total_games}</p>
						</div>
						<div class="stat-card">
							<h3 data-translate="WinRate"></h3>
							<p>${this.userData.win_percent}%</p>
						</div>
					</div>
				</div>

				<div class="profile-content">
					<div class="profile-section stats-section">
						<h2 data-translate= "perf"></h2>
						<div class="chart-container">
							<canvas id="performanceChart"></canvas>
						</div>
					</div>

					<div class="profile-section history-section">
						<h2 data-translate = "matchs" ></h2>
						<div class="match-history">
							${this.renderMatchHistory()}
						</div>
					</div>

					<div class="profile-section friends-section">
						<div class="friends-header">
							<h2 data-translate = "friends" ></h2>
							<button class="search-friends-btn">
								<i class="fas fa-search"></i>
									<span data-translate="Searchfriends"></span>
							</button>
						</div>
						<div id="friends-list">
							${this.renderFriendsList()}
						</div>
					</div>
					<div class="profile-section account-management-section">
						<div class="card account-management-header">
							<h2>Account Management</h2>
							<p class="text-danger">Warning: This action cannot be undone.</p>
							<button class="btn btn-danger" id="deleteAccountBtn">
								<i class="fas fa-trash-alt me-2"></i>Delete Account
							</button>
						</div>
					</div>
				</div>
			</div>
		`;

		this.container.innerHTML = content;

		// Setup event listeners after rendering content
		this.setupEventListeners();
		this.initializeCharts();
	}

	renderMatchHistory() {
		if (!this.userData.match_history || this.userData.match_history.length === 0) {
			return '<div class="match-history-empty">No match history found</div>';
		}

		const MAX_VISIBLE_MATCHES = 3;
		const allMatches = this.userData.match_history;
		const visibleMatches = allMatches.slice(0, MAX_VISIBLE_MATCHES);
		const remainingCount = allMatches.length - MAX_VISIBLE_MATCHES;

		const matchesList = visibleMatches.map(match => `
			<div class="match-card ${match.result.toLowerCase()}">
				<div class="match-info">
					<span class="match-opponent">vs ${SafeText.escape(match.opponent ? match.opponent.username : 'Deleted User')}</span>
					<span class="match-score">${match.user_score} - ${match.opponent_score}</span>
				</div>
				<div class="match-details">
					<span class="match-result">${match.result}</span>
					<span class="match-date">${new Date(match.played_at).toLocaleDateString()}</span>
				</div>
			</div>
		`).join('');

		// Add "View All" button if there are more matches
		const viewAllButton = remainingCount > 0 ? `
			<button class="view-all-matches-btn">
				<i class="fas fa-history"></i>
				<span data-translate ="viewAll"> </span>
			</button>
		` : '';

		return `
			<div class="matches-list-container">
				${matchesList}
				${viewAllButton}
			</div>
		`;
	}

	renderFriendsList() {
		const MAX_VISIBLE_FRIENDS = 2;
		const allFriends = this.userData.friends;
		const visibleFriends = allFriends.slice(0, MAX_VISIBLE_FRIENDS);
		const remainingCount = allFriends.length - MAX_VISIBLE_FRIENDS;

		const friendsList = visibleFriends.map(friend => `
			<div class="friend-card" data-userid="${SafeText.escape(friend.id)}">
				<div class="friend-avatar-container">
					<img src="${SafeText.escape(friend.profile_image || '/static/img/anonymous.webp')}" alt="${SafeText.escape(friend.username)}" class="friend-avatar">
					<span class="online-status ${SafeText.escape(friend.is_online ? 'online' : '')}"></span>
				</div>
				<div class="friend-info">
					<h3>${SafeText.escape(friend.username)}</h3>
					<p class="last-seen">${SafeText.escape(friend.is_online ? 'Online' : `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`)}</p>
					<div class="game-stats">
						<div class="stat-item">
							<span class="stat-label" data-translate="wins"></span>
							<span class="stat-value wins">${SafeText.escape(friend.wins)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate="losses"></span>
							<span class="stat-value losses">${SafeText.escape(friend.losses)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate="TotalGame">:</span>
							<span class="stat-value totalGames">${SafeText.escape(friend.totalGames)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate ="WinRate">:</span>
							<span class="stat-value win-rate">${SafeText.escape(this.calculateWinRate(friend.wins, friend.totalGames))}%</span>
						</div>
					</div>
				</div>
			</div>
		`).join('');

		// Add "View All" button if there are more friends
		const viewAllButton = remainingCount > 0 ? `
			<button class="view-all-friends-btn">
				<i class="fas fa-users"></i>
					<span data-translate ="viewAll"> </span>
			</button>
		` : '';

		return `
			<div class="friends-list-container">
				${friendsList}
				${viewAllButton}
			</div>
		`;
	}

	// Win rate calculation helper
	calculateWinRate(wins, totalGames) {
		if (totalGames === 0) return 0;
		return Math.round((wins / totalGames) * 100);
	}

	setupEventListeners() {
		// Remove all existing event listeners by cloning elements
		const elementsToClone = [
			'.friend-card',
			'.edit-profile-btn',
			'.search-friends-btn',
			'.view-all-friends-btn',
			'.view-all-matches-btn',
			'#deleteAccountBtn'
		];

		elementsToClone.forEach(selector => {
			const elements = document.querySelectorAll(selector);
			elements.forEach(element => {
				const newElement = element.cloneNode(true);
				element.parentNode.replaceChild(newElement, element);
			});
		});

		// Add new event listeners for friend cards
		document.querySelectorAll('.friend-card').forEach(card => {
			card.addEventListener('click', () => {
				const userId = card.dataset.userid;
				const username = card.querySelector('h3').textContent;
				const profileImage = card.querySelector('img').src;
				const isOnline = card.querySelector('.online-status').classList.contains('online');
				const lastSeen = card.querySelector('.last-seen').textContent;
				const wins = card.querySelector('.wins').textContent;
				const losses = card.querySelector('.losses').textContent;
				const totalGames = card.querySelector('.totalGames').textContent;

				const friendInfo = {
					id: userId,
					username: username,
					profile_image: profileImage,
					is_online: isOnline,
					lastSeen: lastSeen,
					wins: wins,
					losses: losses,
					totalGames: totalGames
				};

				this.showFriendInfoModal(friendInfo);
			});
		});

		// Add new event listener for edit profile button
		const editBtn = document.querySelector('.edit-profile-btn');
		if (editBtn) {
			editBtn.addEventListener('click', () => this.showEditModal());
		}

		// Add new event listener for search friends button
		const searchFriendsBtn = document.querySelector('.search-friends-btn');
		if (searchFriendsBtn) {
			searchFriendsBtn.addEventListener('click', () => this.showFriendSearchModal());
		}

		const viewAllBtn = document.querySelector('.view-all-friends-btn');
		if (viewAllBtn) {
			viewAllBtn.addEventListener('click', () => this.showAllFriendsModal());
		}

		const viewAllMatchesBtn = document.querySelector('.view-all-matches-btn');
		if (viewAllMatchesBtn) {
			viewAllMatchesBtn.addEventListener('click', () => this.showAllMatchesModal());
		}

		// Delete account button
		const deleteAccountBtn = document.querySelector('#deleteAccountBtn');
		if (deleteAccountBtn) {
			deleteAccountBtn.addEventListener('click', () => this.showDeleteAccountModal());
		}
	}

	async showEditModal() {
		const modal = document.createElement('div');
		modal.className = 'edit-profile-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="EditProfile"></h2>
				<form id="editProfileForm">
					<div class="avatar-upload">
						<div class="avatar-preview">
							<img src="${SafeText.escape(this.userData.image_path || this.default_path)}" alt="Profile" id="avatarPreview">
						</div>
						<div class="avatar-edit">
							<input type="file" id="avatarInput" accept="image/*">
							<label for="avatarInput" data-translate="ChangePhoto"></label>
						</div>
					</div>
					<div class="form-group">
						<label data-translate="Username"></label>
						<input type="text" value="${SafeText.escape(this.userData.username)}" class="form-input">
					</div>
					<div class="form-group">
						<label data-translate="Email"></label>
						<input type="email" value="${SafeText.escape(this.userData.email)}" class="form-input">
					</div>
					<div class="modal-actions">
						<button type="button" class="cancel-btn" data-translate="cancel"></button>
						<button type="submit" class="save-btn" data-translate="SaveChanges"></button>
					</div>
				</form>
				<button class="modal-close">&times;</button>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupModalListeners(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	setupModalListeners(modal) {
		const closeBtn = modal.querySelector('.modal-close');
		const cancelBtn = modal.querySelector('.cancel-btn');
		const form = modal.querySelector('form');
		const avatarInput = modal.querySelector('#avatarInput');
		const avatarPreview = modal.querySelector('#avatarPreview');

		// Close modal handlers
		[closeBtn, cancelBtn].forEach(btn => {
			btn.addEventListener('click', () => {
				modal.classList.add('fade-out');
				setTimeout(() => modal.remove(), 300);
			});
		});

		// Avatar preview handler
		avatarInput.addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					avatarPreview.src = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		});

		// Form submission handler
		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			const avatarInput = modal.querySelector('#avatarInput');

			const formData = new FormData();
			formData.append("username", modal.querySelector('input[type="text"]').value);
			formData.append("email", modal.querySelector('input[type="email"]').value);
			formData.append("image", avatarInput.files[0]);
			let response;

			try {
				response = await fetch('/api/profile/update', {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'X-CSRFToken': window.csrfToken,
					},
					body: formData
				});

				if (!response.ok) {
					if (response.status == 403) {
						window.router.refreshToken();
					}
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();
				if (result.status === 'success') {
					await this.loadUserData();
					modal.classList.add('fade-out');
					this.render();
					const savedLang = localStorage.getItem("selectedLang") || "en";
					await updateTexts(savedLang);
					setTimeout(() => modal.remove(), 300);
				}
			} catch (error) {
				console.error('Failed to update profile:', error);
			}
		});
	}

	async showFriendSearchModal() {
		const modal = document.createElement('div');
		modal.className = 'friend-search-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="Searchfriends"></h2>
				<div class="search-container">
					<input type="text" id="friendSearchInput" placeholder="Search by username..." data-translate="searchUser_placeholder" class="form-input">
					<button type="button" id="searchButton" class="search-btn" data-translate="Search"></button>
				</div>
				<div id="searchResults" class="search-results"></div>
				<div class="modal-actions">
					<button type="button" class="cancel-btn" data-translate="close"></button>
				</div>
				<button class="modal-close">&times;</button>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupFriendSearchModalListeners(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	setupFriendSearchModalListeners(modal) {
		const closeBtn = modal.querySelector('.modal-close');
		const cancelBtn = modal.querySelector('.cancel-btn');
		const searchInput = modal.querySelector('#friendSearchInput');
		const searchButton = modal.querySelector('#searchButton');
		const resultsContainer = modal.querySelector('#searchResults');

		// Close modal handlers
		[closeBtn, cancelBtn].forEach(btn => {
			btn.addEventListener('click', () => {
				modal.classList.add('fade-out');
				setTimeout(() => modal.remove(), 300);
			});
		});

		// Search handler
		const handleSearch = async () => {
			const searchTerm = searchInput.value.trim();
			if (!searchTerm) return;

			let response;

			try {
				response = await fetch('/api/search_user', {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': window.csrfToken,
					},
					body: JSON.stringify({ 'search_term': searchTerm })  // キーを'search_term'に修正
				});

				if (response.status == 403) {
					window.router.refreshToken();
					throw new Error(response.status);
				}

				const result = await response.json();

				if (result.status === 'success' && Array.isArray(result.data)) {
					resultsContainer.innerHTML = result.data.map(user => `
						<div class="search-result-item">
							<div class="user-info">
								<img src="${user.profile_image || '/static/img/anonymous.webp'}" alt="${SafeText.escape(user.username)}" class="user-avatar">
								<div class="user-details">
									<h3>${SafeText.escape(user.username)}</h3>
									<span class="status ${user.is_online ? 'online' : ''}">${user.is_online ? 'Online' : 'Offline'}</span>
								</div>
							</div>
							<button class="add-friend-btn" data-userid="${user.id}" ${user.is_friend ? 'disabled' : ''}>
								${user.is_friend ? '<i class="fas fa-check"></i> Friends' : '<i class="fas fa-user-plus"></i> Add Friend'}
							</button>
						</div>
					`).join('');
				} else {
					resultsContainer.innerHTML = '<p>No users found</p>';
				}
				const addFriendButtons = document.querySelectorAll('.add-friend-btn');
				addFriendButtons.forEach(async (btn) => {
					btn.addEventListener('click', async () => {
						let response;

						try {
							response = await fetch('/api/add_friend', {
								method: 'POST',
								credentials: 'same-origin',
								headers: {
									'Content-Type': 'application/json',
									'X-CSRFToken': window.csrfToken,
								},
								body: JSON.stringify({ 'friend_id': btn.dataset.userid })
							});

							if (response.status == 403) {
								window.router.refreshToken();
								throw new Error(response.status);
							}

							const result = await response.json();

							if (result.status === 'success') {
								btn.disabled = true;
								btn.textContent = 'Friends';
								await this.loadUserData();
								const friendsList = document.getElementById('friends-list');
								if (friendsList) {
									friendsList.innerHTML = this.renderFriendsList();
									// setup event listeners for new friend
									this.setupEventListeners();
								}
							}
						} catch (error) {
							console.error('Failed to add friend:', error);
						}
					});
				});
			} catch (error) {
				console.error('Search failed:', error);
				resultsContainer.innerHTML = '<p>Error searching for users</p>';
			}
		};

		searchButton.addEventListener('click', handleSearch);
		searchInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') handleSearch();
		});
	}

	async showFriendInfoModal(friendInfo) {
		const modal = document.createElement('div');
		modal.className = 'friend-info-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="friends"></h2>
				<div class="friend-profile">
					<div class="friend-avatar-large">
						<img src="${SafeText.escape(friendInfo.profile_image)}" alt="${SafeText.escape(friendInfo.username)}">
						<span class="online-status ${SafeText.escape(friendInfo.is_online ? 'online' : '')}"></span>
					</div>
					<div class="friend-details">
						<h3>${SafeText.escape(friendInfo.username)}</h3>
						<p class="status-text">${SafeText.escape(friendInfo.is_online ? 'Online' : friendInfo.lastSeen)}</p>
						<div class="stats-container">
							<div class="stat-box">
								<span class="stat-title" data-translate="wins"></span>
								<span class="stat-number wins">${SafeText.escape(friendInfo.wins)}</span>
							</div>
							<div class="stat-box">
								<span class="stat-title" data-translate="losses"></span>
								<span class="stat-number losses">${SafeText.escape(friendInfo.losses)}</span>
							</div>
							<div class="stat-box">
								<span class="stat-title" data-translate="TotalGame"></span>
								<span class="stat-number total">${SafeText.escape(friendInfo.totalGames)}</span>
							</div>
							<div class="stat-box">
								<span class="stat-title" data-translate="WinRate"></span
								<span class="stat-number win-rate">
									${this.calculateWinRate(friendInfo.wins, friendInfo.totalGames)}%
								</span>
							</div>
						</div>
						<button class="remove-friend-btn danger-btn" data-translate="removeFriend">
							<i class="fas fa-user-minus"></i> Remove Friend
						</button>
					</div>
				</div>
				<div class="modal-actions">
					<button type="button" class="close-btn" data-translate="close"></button>
				</div>
				<button class="modal-close">&times;</button>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupFriendInfoModalListeners(modal, friendInfo);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	setupFriendInfoModalListeners(modal, friendInfo) {
		const closeBtn = modal.querySelector('.modal-close');
		const cancelBtn = modal.querySelector('.close-btn');
		const removeFriendBtn = modal.querySelector('.remove-friend-btn');

		[closeBtn, cancelBtn].forEach(btn => {
			btn.addEventListener('click', () => {
				modal.classList.add('fade-out');
				setTimeout(() => modal.remove(), 300);
			});
		});

		removeFriendBtn.addEventListener('click', () => {
			this.showRemoveFriendConfirmModal(modal, friendInfo.id, friendInfo.username);
		});
	}

	async showRemoveFriendConfirmModal(parentModal, userId, username) {
		const modal = document.createElement('div');
		modal.className = 'confirm-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="removeFriend"></h2>
				<p class="warning-text">
					<span data-translate="warning1"></span>
					<span class="username">${SafeText.escape(username)}</span>
					<span data-translate="warning2"></span>
				</p>
				<div class="modal-actions">
					<button type="button" class="cancel-btn" data-translate="cancel"></button>
					<button type="button" class="confirm-btn danger-btn" data-translate="removeFriend"></button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupRemoveFriendModalListeners(modal, parentModal, userId);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	setupRemoveFriendModalListeners(modal, parentModal, userId) {
		const cancelBtn = modal.querySelector('.cancel-btn');
		const confirmBtn = modal.querySelector('.confirm-btn');

		cancelBtn.addEventListener('click', () => {
			modal.classList.add('fade-out');
			setTimeout(() => modal.remove(), 300);
		});

		confirmBtn.addEventListener('click', async () => {
			try {
				let response;

				response = await fetch('/api/remove_friend', {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': window.csrfToken,
					},
					body: JSON.stringify({ 'userid': userId })
				});

				if (response.status == 403) {
					window.router.refreshToken();
					throw new Error(response.status);
				}

				const result = await response.json();
				if (result.status === 'success') {
					modal.remove();
					parentModal.remove();
					await this.loadUserData();
					this.render();
					const savedLang = localStorage.getItem("selectedLang") || "en";
					await updateTexts(savedLang);
				}
			} catch (error) {
				console.error('Failed to remove friend:', error);
			}
		});
	}

	initializeCharts() {
		// Destroy existing chart if it exists
		if (this.chart) {
			this.chart.destroy();
		}

		const ctx = document.getElementById('performanceChart').getContext('2d');
		this.chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: [translationsData["wins"], translationsData["losses"]],
				datasets: [{
					data: [this.userData.wins, this.userData.losses],
					backgroundColor: [
						'#2ecc71',
						'#e74c3c'
					],
					borderWidth: 0
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 20,
							font: {
								size: 14
							}
						}
					}
				},
				cutout: '70%'
			}
		});
	}

	async showAllFriendsModal() {
		const modal = document.createElement('div');
		modal.className = 'all-friends-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="AllFriends"></h2>
				<div class="friends-list">
					${this.renderAllFriends()}
				</div>
				<div class="modal-actions">
					<button type="button" class="close-btn" data-translate="close"></button>
				</div>
				<button class="modal-close">&times;</button>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupAllFriendsModalListeners(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	renderAllFriends() {
		return this.userData.friends.map(friend => `
			<div class="friend-card" data-userid="${SafeText.escape(friend.id)}">
				<div class="friend-avatar-container">
					<img src="${SafeText.escape(friend.profile_image || '/static/img/anonymous.webp')}" alt="${SafeText.escape(friend.username)}" class="friend-avatar">
					<span class="online-status ${SafeText.escape(friend.is_online ? 'online' : '')}"></span>
				</div>
				<div class="friend-info">
					<h3>${SafeText.escape(friend.username)}</h3>
					<p class="last-seen">${SafeText.escape(friend.is_online ? 'Online' : `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`)}</p>
					<div class="game-stats">
						<div class="stat-item">
							<span class="stat-label" data-translate="wins"></span>
							<span class="stat-value wins">${SafeText.escape(friend.wins)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate="losses"></span>
							<span class="stat-value losses">${SafeText.escape(friend.losses)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate="TotalGame">:</span>
							<span class="stat-value totalGames">${SafeText.escape(friend.totalGames)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label" data-translate="WinRate">:</span>
							<span class="stat-value win-rate">${SafeText.escape(this.calculateWinRate(friend.wins, friend.totalGames))}%</span>
						</div>
					</div>
				</div>
			</div>
		`).join('');
	}

	setupAllFriendsModalListeners(modal) {
		const closeBtn = modal.querySelector('.modal-close');
		const cancelBtn = modal.querySelector('.close-btn');

		[closeBtn, cancelBtn].forEach(btn => {
			btn.addEventListener('click', () => {
				modal.classList.add('fade-out');
				setTimeout(() => modal.remove(), 300);
			});
		});

		// Setup friend card click events
		const friendCards = modal.querySelectorAll('.friend-card');
		friendCards.forEach(card => {
			card.addEventListener('click', () => {
				const userId = card.dataset.userid;
				const friend = this.userData.friends.find(f => f.id === parseInt(userId));
				if (friend) {
					const friendInfo = {
						id: friend.id,
						username: friend.username,
						profile_image: friend.profile_image || '/static/img/anonymous.webp',
						is_online: friend.is_online,
						lastSeen: friend.lastSeen,
						wins: friend.wins || 0,
						losses: friend.losses || 0,
						totalGames: friend.totalGames || 0
					};

					this.showFriendInfoModal(friendInfo);
				}
			});
		});
	}

	async showAllMatchesModal() {
		const modal = document.createElement('div');
		modal.className = 'match-history-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate="MatchHistory"></h2>
				<div class="matches-list">
					${this.renderAllMatches()}
				</div>
				<div class="modal-actions">
					<button type="button" class="close-btn" data-translate="close"></button>
				</div>
				<button class="modal-close">&times;</button>
			</div>
		`;

		document.body.appendChild(modal);
		this.setupAllMatchesModalListeners(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	renderAllMatches() {
		return this.userData.match_history.map(match => `
			<div class="match-card ${match.result.toLowerCase()}">
				<div class="match-info">
					<span class="match-opponent">vs ${SafeText.escape(match.opponent ? match.opponent.username : 'Deleted User')}</span>
					<span class="match-score">${SafeText.escape(match.user_score)} - ${SafeText.escape(match.opponent_score)}</span>
				</div>
				<div class="match-details">
					<span class="match-result">${SafeText.escape(match.result)}</span>
					<span class="match-date">${SafeText.escape(new Date(match.played_at).toLocaleDateString())}</span>
				</div>
			</div>
		`).join('');
	}

	setupAllMatchesModalListeners(modal) {
		const closeBtn = modal.querySelector('.modal-close');
		const cancelBtn = modal.querySelector('.close-btn');

		[closeBtn, cancelBtn].forEach(btn => {
			btn.addEventListener('click', () => {
				modal.classList.add('fade-out');
				setTimeout(() => modal.remove(), 300);
			});
		});
	}

	async showDeleteAccountModal() {
		const modal = document.createElement('div');
		modal.className = 'confirm-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2>Delete Account</h2>
				<p class="warning-text">Are you sure you want to delete your account? This action cannot be undone.</p>
				<div class="modal-actions">
					<button type="button" class="cancel-btn">Cancel</button>
					<button type="button" class="confirm-btn danger-btn">Delete Account</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);

		// Setup confirmation modal event listeners
		const cancelBtn = modal.querySelector('.cancel-btn');
		const confirmBtn = modal.querySelector('.confirm-btn');

		cancelBtn.addEventListener('click', () => {
			modal.classList.add('fade-out');
			setTimeout(() => modal.remove(), 300);
		});

		confirmBtn.addEventListener('click', async () => {
			try {
				let response;

				response = await fetch('/api/delete_account', {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': window.csrfToken,
					}
				});

				if (response.status == 403) {
					window.router.refreshToken();
					throw new Error(response.status);
				}

				const result = await response.json();
				if (result.status === 'success') {
					modal.remove();
					window.location.href = '/logout';
				}
			} catch (error) {
				console.error('Failed to delete account:', error);
			}
		});
		
	}

	clean() {
		return ;
	}
}




