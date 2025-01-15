export class RegisterPage {
    async handle() {
        const content = `
<section class="gradient-custom">
    <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                <div class="card bg-dark text-white" style="border-radius: 1rem;">
                    <div class="card-body p-5 text-center">
                        <div class="mb-md-5 mt-md-4 pb-5">
                            <h2 class="fw-bold mb-2 text-uppercase">Register</h2>
                            <p class="text-white-50 mb-5">Create your account</p>

                            <div class="form-outline form-white mb-4">
                                <input type="text" id="typeUsernameX" class="form-control form-control-lg" placeholder="Username" />
                            </div>

                            <div class="form-outline form-white mb-4">
                                <input type="email" id="typeEmailX" class="form-control form-control-lg" placeholder="Email" />
                            </div>

                            <div class="form-outline form-white mb-4">
                                <input type="password" id="typePasswordX" class="form-control form-control-lg" placeholder="Password" />
                            </div>

                            <div class="form-outline form-white mb-4">
                                <input type="password" id="typeConfirmPasswordX" class="form-control form-control-lg" placeholder="Confirm Password" />
                            </div>

                            <button class="btn btn-outline-light btn-lg px-5" type="submit">Register</button>

                            <div class="d-flex justify-content-center text-center mt-4 pt-1">
                                <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                                <a href="#!" class="text-white"><i class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                                <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                            </div>
                        </div>

                        <div>
                            <p class="mb-0">Already have an account? <a href="/login" data-path="/login" class="text-white-50 fw-bold">Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
        `;

        document.getElementById('dynamicPage').innerHTML = content;
    }
}
