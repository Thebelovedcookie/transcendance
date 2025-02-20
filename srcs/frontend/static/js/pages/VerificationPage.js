export class VerificationPage {
	constructor() {
	}

	async handle() {
		const content = `
<section class="gradient-custom">
	<div class="container py-5 h-100">
		<div class="row d-flex justify-content-center align-items-center h-100">
			<div class="col-12 col-md-8 col-lg-6 col-xl-5">
				<div class="card bg-dark text-white" style="border-radius: 1rem;">
					<div class="card-body p-5 text-center">
						<div class="mb-md-5 mt-md-4 pb-5">
							<h2 class="fw-bold mb-2 text-uppercase">Email Verification</h2>
							<p class="text-white-50 mb-5">Please enter the 6-digit code sent to your email</p>

							<div class="form-outline form-white mb-4">
								<input type="text" id="verificationCode" class="form-control form-control-lg"
									maxlength="6" placeholder="Enter 6-digit code" />
								<div id="codeError" class="text-danger small mt-1" style="display: none;">
									Invalid verification code
								</div>
							</div>

							<button class="btn btn-outline-light btn-lg px-5" type="submit" id="verifyButton">
								Verify Email
							</button>

							<div class="mt-3">
								<button class="btn btn-link text-white-50" id="resendButton">
									Resend verification code
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	</section>
		`;

		document.getElementById('dynamicPage').innerHTML = content;
		this.addEventListeners();
	}

	async verifyCode(e) {
		e.preventDefault();
		const code = document.getElementById('verificationCode').value;
		const codeError = document.getElementById('codeError');

		if (!code || code.length !== 6) {
			codeError.textContent = 'Please enter a valid 6-digit code';
			codeError.style.display = 'block';
			return;
		}

		try {
			const response = await fetch('/api/verify_email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': window.csrfToken,
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					email: sessionStorage.getItem('pendingVerificationEmail'),
					code: code
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Clear the pending verification email
				sessionStorage.removeItem('pendingVerificationEmail');
				// Redirect to login page
				window.router.navigateTo('/login');
			} else {
				codeError.textContent = data.message || 'Invalid verification code';
				codeError.style.display = 'block';
			}
		} catch (error) {
			console.error('Error:', error);
			codeError.textContent = 'An error occurred. Please try again.';
			codeError.style.display = 'block';
		}
	}

	async resendCode(e) {
		e.preventDefault();
		const resendButton = document.getElementById('resendButton');
		resendButton.disabled = true;

		try {
			const response = await fetch('/api/resend_verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': window.csrfToken,
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					email: this.email
				})
			});

			const data = await response.json();

			if (response.ok) {
				alert('New verification code has been sent to your email.');
			} else {
				alert(data.message || 'Failed to resend verification code.');
			}
		} catch (error) {
			console.error('Error:', error);
			alert('An error occurred. Please try again.');
		} finally {
			resendButton.disabled = false;
		}
	}

	addEventListeners() {
		document.getElementById('verifyButton').addEventListener('click', (e) => this.verifyCode(e));
		document.getElementById('resendButton').addEventListener('click', (e) => this.resendCode(e));
	}

	clean() {
		return;
	}
}
