//KEY CONTROL

const playerOneKeys = {
    up: "w",
    down: "s"
};

const playerTwoKeys = {
    up: "o",
    down: "l"
};

// Fonction pour gérer les mouvements de joueur 1
export function keyPressListenerPlayerOne(event, playerOne, canvas) {
    if (event.key === playerOneKeys.up && playerOne.y-playerOne.gravity > 0) {
        playerOne.y -= playerOne.gravity * 7;  // Déplace joueur 1 vers le haut
    } else if (event.key === playerOneKeys.down && playerOne.y + playerOne.height + playerOne.gravity < canvas.height) {
        playerOne.y += playerOne.gravity * 7;  // Déplace joueur 1 vers le bas
    }
}

// Fonction pour gérer les mouvements de joueur 2
export function keyPressListenerPlayerTwo(event, playerTwo, canvas) {
    if (event.key === playerTwoKeys.up && playerTwo.y-playerTwo.gravity > 0) {
        playerTwo.y -= playerTwo.gravity * 7;  // Déplace joueur 2 vers le haut
    } else if (event.key === playerTwoKeys.down && playerTwo.y + playerTwo.height + playerTwo.gravity < canvas.height) {
        playerTwo.y += playerTwo.gravity * 7;  // Déplace joueur 2 vers le bas
    }
}