export class LogoutPage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        // Call logout process
        await this.handleLogout();
    }

    async handleLogout() {
        // Show logout message in console
        console.log('Executing logout process...');

        // Clear any user-related data from localStorage if needed

        // Navigate to home using window.history
        window.history.pushState({}, '', '/');

        // Dispatch a popstate event to trigger the router's handleLocation
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}
