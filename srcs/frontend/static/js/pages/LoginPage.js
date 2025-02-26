export class LoginPage {
	async handle() {
		const loginHTML = `
<section class="gradient-custom">
  <div class="container py-5 h-100">
	<div class="row d-flex justify-content-center align-items-center h-100">
	  <div class="col-12 col-md-8 col-lg-6 col-xl-5">
		<div class="card bg-dark text-white" style="border-radius: 1rem;">
		  <div class="card-body p-5 text-center">

			<div class="mb-md-5 mt-md-4 pb-5">

			  <h2 class="fw-bold mb-2 text-uppercase" data-translate = "Login"></h2>
			  <p class="text-white-50 mb-5" data-translate = "settinglog"></p>

			  <div data-mdb-input-init class="form-outline form-white mb-4">
				<input type="email" id="typeEmailX" class="form-control form-control-lg" placeholder="Email" data-translate="email_placeholder"/>
				<div id="emailError" class="text-danger small mt-1" style="display: none;" data-translate= "emailerror"></div>
			  </div>

			  <div data-mdb-input-init class="form-outline form-white mb-4">
				<input type="password" id="typePasswordX" class="form-control form-control-lg" placeholder="Password" data-translate="pwd_placeholder"/>
				<div id="passwordError" class="text-danger small mt-1" style="display: none;" data-translate= "errorpwd"></div>
			  </div>

			  <p class="small mb-5 pb-lg-2"><a class="text-white-50" href="#!" data-translate ="forgotpwd"></a></p>

			  <button data-mdb-button-init data-mdb-ripple-init class="btn btn-outline-light btn-lg px-5" type="submit" id="loginButton" data-translate="Login"></button>

			  <div class="d-flex justify-content-center text-center mt-4 pt-1">
				<a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
				<a href="#!" class="text-white"><i class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
				<a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
			  </div>

			</div>

			<div>
			  <p class="mb-0"data-translate="notyet">Don't have an account? <a href="/register" data-path="/register" class="text-white-50 fw-bold" data-translate ="sign">Sign Up</a>
			  </p>
			</div>

		  </div>
		</div>
	  </div>
	</div>
  </div>
</section>
		`;

		document.getElementById('dynamicPage').innerHTML = loginHTML;

		// Add event listener for form validation
		document.getElementById('loginButton').addEventListener('click', (e) => this.sendToBackend(e));
	}

	isValidEmail(email) {
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		return emailRegex.test(email);
	}

	validateForm(e) {
		const email		= document.getElementById('typeEmailX');
		const password	= document.getElementById('typePasswordX');
		const emailError	= document.getElementById('emailError');
		const passwordError	= document.getElementById('passwordError');

		let isValid		= true;

		// Reset error messages
		emailError.style.display = 'none';
		passwordError.style.display = 'none';

		// Validate email(if empty)
		if (!email.value.trim()) {
			emailError.textContent = 'Email is required';
			emailError.style.display = 'block';
			isValid = false;
		} else if (!this.isValidEmail(email.value.trim())) {
			emailError.textContent = 'Invalid email address';
			emailError.style.display = 'block';
			isValid = false;
		}

		// Validate password
		if (!password.value.trim()) {
			passwordError.textContent = 'Password is required';
			passwordError.style.display = 'block';
			isValid = false;
		} else if (password.value.trim().length < 8) {
			passwordError.textContent = 'Password must be at least 8 characters long';
			passwordError.style.display = 'block';
			isValid = false;
		}
		if (isValid) {
			return true;
		}
		return false;
	}

	async sendToBackend(e) {
		e.preventDefault();
		if (this.validateForm(e) == false) {
			return false;
		}

		let response;

		try {
			// sending a post request to the backend -> (email, username, password)
			//Who will allow us to login
			/*---------------------------REQUEST-----------------------------*/
			response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': window.csrfToken,
				},
				credentials: 'same-origin',
				body: JSON.stringify({ 'email': document.getElementById('typeEmailX').value,
					'password': document.getElementById('typePasswordX').value
				})
			});
			/*--------------------------ENDREQUEST----------------------------*/

			const data = await response.json();
			//if we get a bad response
			if (!response.ok) {
				const message = data.message;
				const code = data.code;
				if (code == 'account_not_activated') {
					// Store email for verification page
					sessionStorage.setItem('pendingVerificationEmail', document.getElementById('typeEmailX').value);
					// Navigate to verification page
					window.router.navigateTo('/verify');
					return false;
				}
				passwordError.textContent = message;
				passwordError.style.display = 'block';
				return false;
			}

			window.router.navigateTo('/profile');

		} catch (error) {
			console.error('Error details:', error);
			passwordError.textContent = translationsData["ErrorLogin"];
			passwordError.style.display = 'block';
			if (response.status == 403) {
				window.router.refreshToken();
			}
			throw error;
		}
	}

	clean() {
		return ;
	}
}
