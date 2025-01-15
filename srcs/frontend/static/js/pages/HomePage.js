export class HomePage {
    async handle() {
        const content = `
            <div class="home-container">
                <div class="text-center">
                    <a href="/pong" data-path="/pong" class="play-btn">
                        PLAY
                    </a>
                </div>
            </div>
        `;

        document.getElementById('dynamicPage').innerHTML = content;

        // Add floating animation after content is loaded
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            // Initial animation
            playBtn.classList.add('float');
        }
    }
}
