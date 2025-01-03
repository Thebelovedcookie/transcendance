// Fonction pour injecter la navbar
export function injectNavbar() {
	return `
	<nav class="navbar navbar-expand-lg bg-secondary fixed-top w-100">
		<div class="container-fluid">
			<a class="navbar-brand" href="#">
				<img src="./img/logo.png" alt="Bootstrap" width="110" height="25">
			</a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link active" aria-current="page" href="#" id="homeLink">Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#" id="gameLink">Game</a>
					</li>
					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							More
						</a>
						<ul class="dropdown-menu">
							<li><a class="dropdown-item" href="#">ScoreBoard</a></li>
							<li><a class="dropdown-item" href="#">pouet</a></li>
							<li><hr class="dropdown-divider"></li>
							<li><a class="dropdown-item" href="#">pouetpouet</a></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</nav>
	<footer class="bg-secondary text-black text-center py-3 fixed-bottom">
    	&copy; 2025 PongSite - All Rights Reserved
	</footer>`;
}[]