export class ProfilePage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
        this.chartLoaded = false;
        this.userData = null;
        this.userData = {
            username: "Player123",
            email: "player123@example.com",
            join_date: "2024-01-15",
            totalGames: 150,
            wins: 89,
            losses: 61
        };
        this.matchHistory = [
            { opponent: "User456", result: "Win", date: "2024-03-20", score: "11-5" },
            { opponent: "GameMaster", result: "Loss", date: "2024-03-19", score: "8-11" },
            { opponent: "PongKing", result: "Win", date: "2024-03-18", score: "11-7" }
        ];
        this.friends = [
            { userName: "PongMaster", online: true, lastSeen: "Now" },
            { userName: "GamePro", online: false, lastSeen: "2 hours ago" },
            { userName: "Champion", online: true, lastSeen: "Now" },
            { userName: "PongKing", online: false, lastSeen: "1 day ago" }
        ];
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
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
					'X-CSRFToken': window.csrfToken,
					'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                this.userData = data.data;
            }
        } catch (error) {
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
        var win_percent = 0;
        if (this.userData.totalGames != 0) {
            win_percent = Math.round(this.userData.wins / this.userData.totalGames * 100);
        }
        const content = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-info">
                        <div class="profile-avatar-container">
                            <img src="${this.userData.profile_image || '/static/img/anonymous.webp'}" alt="Profile" class="profile-avatar">
                            <span class="online-status ${this.userData.online ? 'online' : ''}"></span>
                        </div>
                        <div class="profile-details">
                            <h1>${this.userData.username}</h1>
                            <p>Member since: ${this.userData.join_date}</p>
                            <button class="edit-profile-btn">
                                <i class="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-card">
                            <h3>Total Games</h3>
                            <p>${this.userData.totalGames}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Win Rate</h3>
                            <p>${win_percent}%</p>
                        </div>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section stats-section">
                        <h2>Performance Stats</h2>
                        <div class="chart-container">
                            <canvas id="performanceChart"></canvas>
                        </div>
                    </div>

                    <div class="profile-section history-section">
                        <h2>Recent Matches</h2>
                        <div class="match-history">
                            ${this.renderMatchHistory()}
                        </div>
                    </div>

                    <div class="profile-section friends-section">
                        <div class="friends-header">
                            <h2>Friends</h2>
                            <button class="search-friends-btn">
                                <i class="fas fa-search"></i> Search Friends
                            </button>
                        </div>
                        <div class="friends-list">
                            ${this.renderFriendsList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = content;
    }

    renderMatchHistory() {
        return this.matchHistory.map(match => `
            <div class="match-card ${match.result.toLowerCase()}">
                <div class="match-info">
                    <span class="match-opponent">${match.opponent}</span>
                    <span class="match-score">${match.score}</span>
                </div>
                <div class="match-details">
                    <span class="match-result">${match.result}</span>
                    <span class="match-date">${match.date}</span>
                </div>
            </div>
        `).join('');
    }

    renderFriendsList() {
        return this.userData.friends.map(friend => `
            <div class="friend-card">
                <div class="friend-avatar-container">
                    <img src="${friend.profile_image || '/static/img/anonymous.webp'}" alt="${friend.userName}" class="friend-avatar">
                    <span class="online-status ${friend.online ? 'online' : ''}"></span>
                </div>
                <div class="friend-info">
                    <h3>${friend.username}</h3>
                    <p>${friend.is_online ? 'Online' : `Last seen ${friend.lastSeen}`}</p>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const editBtn = document.querySelector('.edit-profile-btn');
        editBtn.addEventListener('click', () => this.showEditModal());

        // Add friend search button listener
        const searchFriendsBtn = document.querySelector('.search-friends-btn');
        searchFriendsBtn.addEventListener('click', () => this.showFriendSearchModal());
    }

    showEditModal() {
        const modal = document.createElement('div');
        modal.className = 'edit-profile-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Profile</h2>
                <form id="editProfileForm">
                    <div class="avatar-upload">
                        <div class="avatar-preview">
                            <img src="${this.userData.profile_image || '/static/img/anonymous.webp'}" alt="Profile" id="avatarPreview">
                        </div>
                        <div class="avatar-edit">
                            <input type="file" id="avatarInput" accept="image/*">
                            <label for="avatarInput">
                                <i class="fas fa-camera"></i>
                                Change Photo
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" value="${this.userData.username}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${this.userData.email}" class="form-input">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
                <button class="modal-close">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalListeners(modal);
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

			const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

            const formData = new FormData();
            const avatarInput = modal.querySelector('#avatarInput');
            const profileData = {
                username: modal.querySelector('input[type="text"]').value,
                email: modal.querySelector('input[type="email"]').value
            };

            if (avatarInput.files[0]) {
                formData.append('profile_image', avatarInput.files[0]);
            }
            formData.append('data', JSON.stringify(profileData));

            try {
                const response = await fetch('/api/profile/update', {
                    method: 'POST',
                    credentials: 'include',
					headers: {
						'X-CSRFToken': csrfToken,
						'Content-Type': 'application/json',
					},
                    //body: formData
                    body: JSON.stringify({ 'username': modal.querySelector('input[type="text"]').value,
                        'email': modal.querySelector('input[type="email"]').value,
                        'image': avatarInput.files[0]
                     })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.status === 'success') {
                    this.render();
                    modal.classList.add('fade-out');
                    setTimeout(() => modal.remove(), 300);
                }
            } catch (error) {
                console.error('Failed to update profile:', error);
            }
        });
    }

    showFriendSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'friend-search-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Search Friends</h2>
                <div class="search-container">
                    <input type="text" id="friendSearchInput" placeholder="Search by username..." class="form-input">
                    <button type="button" id="searchButton" class="search-btn">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
                <div id="searchResults" class="search-results">
                    <!-- Search results will be displayed here -->
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-btn">Close</button>
                </div>
                <button class="modal-close">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupFriendSearchModalListeners(modal);
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

            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('csrftoken='))
                ?.split('=')[1];

            try {
                const response = await fetch('/api/search_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({ 'search_term': searchTerm })  // キーを'search_term'に修正
                });

                const result = await response.json();

				console.log(result.data);

                if (result.status === 'success' && Array.isArray(result.data)) {
                    resultsContainer.innerHTML = result.data.map(user => `
                        <div class="search-result-item">
                            <div class="user-info">
                                <img src="${user.profile_image || '/static/img/anonymous.webp'}" alt="${user.username}" class="user-avatar">
                                <div class="user-details">
                                    <h3>${user.username}</h3>
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
						try {
							const response = await fetch('/api/add_friend', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'X-CSRFToken': csrfToken,
								},
								body: JSON.stringify({ 'userid': btn.dataset.userid })
							});

							const result = await response.json();

							console.log(result);
							if (result.status === 'success') {
								btn.disabled = true;
								btn.textContent = 'Friends';
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

    initializeCharts() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses'],
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
}
