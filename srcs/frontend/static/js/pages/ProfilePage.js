export class ProfilePage {
    async handle() {
        const content = `
            <div class="profile-container">
                <h1>Profile</h1>
            </div>
        `;

        document.getElementById('dynamicPage').innerHTML = content;
    }
}
