export class RegisterPage {
    async handle() {
        const content = `
            <div class="register-container">
                <h1>Register</h1>
            </div>
        `;

        document.getElementById('dynamicPage').innerHTML = content;
    }
}
