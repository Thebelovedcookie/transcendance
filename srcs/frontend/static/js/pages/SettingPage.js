export class SettingPage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        this.render();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'game-container';
        gameContent.innerHTML = `
            <div class="setting-menu">
            <h2>Select theme</h2>
        </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);

    }
}
