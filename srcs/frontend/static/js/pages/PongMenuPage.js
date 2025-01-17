export class PongMenuPage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        this.render();
    }

    render() {
        const menuContent = document.createElement('div');
        menuContent.innerHTML = `
            <div class="pong-menu">
                <h2>Select Game Mode</h2>
                <div class="button-container">
                    <button data-path="/pong/normal">Normal Mode</button>
                    <button data-path="/pong/solo">Solo Mode</button>
                    <button data-path="/pong/tournement">Tournement Mode</button>
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(menuContent);
    }
}

/* 

    This is exactly the same thing than the HomePage

    but this time we are sending the PongMenuPage

*/