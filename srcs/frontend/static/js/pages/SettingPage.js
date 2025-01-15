export class SettingPage {
    async handle() {
        const content = `
            <div class="settings-container">
                <h1>Settings</h1>
            </div>
        `;

        document.getElementById('dynamicPage').innerHTML = content;
    }
}
