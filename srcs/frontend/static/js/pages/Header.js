export class Header {
	constructor() {
		this.container = document.getElementById('header-container');
	}

	async render() {
		try {
			const authState = window.router.getAuthState();
			const isLoggedIn = authState.isAuthenticated;
			const username = authState.username;

			this.container.innerHTML = `
				<nav class="navbar navbar-expand-lg navbar-light bg-secondary">
					<div class="container-fluid">
						<a class="navbar-brand" href="/" data-path="/">
							<img src="/static/img/logo.png" alt="Logo" width="80" height="40">
						</a>
						<div class="d-flex align-items-center">
						  <!-- Sélecteur de langue -->
							<select id="languageSelector" class="form-select me-3" >
								<option value="en">English</option>
								<option value="fr">Francais</option>
								<option value="es">Spanish</option>
								<option value="ja">日本語</option>
							</select>
							${isLoggedIn ?
								`<div class="text-light me-3">
									<span  data-translate="Welcome1"></span>
									${username}
								</div>
								 <div class="dropdown">
									<img src="/static/img/anonymous.webp" class="rounded-circle" alt="Profile" width="40" height="40" style="cursor: pointer" data-bs-toggle="dropdown">
									<ul class="dropdown-menu dropdown-menu-end">
										<li><a class="dropdown-item" href="/profile" data-path="/profile" data-translate="Mypage"></a></li>
										<li><a class="dropdown-item" href="/settings" data-path="/settings" data-translate="Settings"></a></li>
										<li><hr class="dropdown-divider"></li>
										<li><a class="dropdown-item" href="/logout" data-path="/logout" data-translate="Logout"></a></li>
									</ul>
								 </div>` :
								`<div class="dropdown">
									<img src="/static/img/anonymous.webp" class="rounded-circle" alt="Profile" width="40" height="40" style="cursor: pointer" data-bs-toggle="dropdown">
									<ul class="dropdown-menu dropdown-menu-end">
										<li><a class="dropdown-item" href="/login" data-path="/login" data-translate="Login">Login</a></li>
										<li><a class="dropdown-item" href="/register" data-path="/register" data-translate="Register">Register</a></li>
									</ul>
								 </div>`
							}
						</div>
					</div>
				</nav>
			`;
			// Charger la langue sauvegardée
			const savedLang = localStorage.getItem("selectedLang") || "en";
			document.getElementById("languageSelector").value = savedLang;
			await updateTexts(savedLang);
	
			// Ajouter un écouteur d'événements pour changer la langue
			document.getElementById("languageSelector").addEventListener("change", async (event) => {
				const selectedLang = event.target.value;
				localStorage.setItem("selectedLang", selectedLang);
				await updateTexts(selectedLang);
			});
		} catch (error) {
			console.error('Failed to render header:', error);
		}
	}
	
	clean() {
		return ;
	}
}
