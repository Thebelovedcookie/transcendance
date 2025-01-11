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
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(menuContent);
    }
}
