export class LoginPage {
    async handle() {
        const content = `
            <div class="login-container">
                <h1>Login</h1>
            </div>
        `;

        document.getElementById('dynamicPage').innerHTML = content;
    }
}
