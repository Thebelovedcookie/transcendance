export class HomePage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        this.render();
    }

    render() {
        const homeContent = document.createElement('div');
        homeContent.innerHTML = `
            <h1>Welcome to the home page</h1>
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 text-center">
                        <a href="/pong" data-path="/pong" class="btn btn-primary btn-lg pong-btn">
                            <i class="bi bi-controller me-2"></i>
                            Start Game
                        </a>
                        <p class="mt-3 text-muted">Click to play Pong!</p>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(homeContent);
    }
}

/*
    first step : 

    We are taking the content of our dynamicPage using getElementById(dynamicPage);

    then in the function render() we are going to create a element call <div></div>

    then put in it the content we want to have. 

    This result at the end:

    <div>
        <h1>Welcome to the home page</h1>
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 text-center">
                    <a href="/pong" data-path="/pong" class="btn btn-primary btn-lg pong-btn">
                        <i class="bi bi-controller me-2"></i>
                        Start Game
                    </a>
                    <p class="mt-3 text-muted">Click to play Pong!</p>
                </div>
            </div>
        </div>
    </div>

    the function appendChild will add this section above at our dynamicPage.
*/
