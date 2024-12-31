export function resetGame(playerOne, playerTwo, canvas,) {

	playerOne.x = 5;
	playerOne.y = canvas.height * 0.4;
	playerOne.width = canvas.width / 80;
	playerOne.height = canvas.height / 6;
	playerOne.gravity = 2;

	playerTwo.x = canvas.width - 20;
	playerTwo.y = canvas.height * 0.4;
	playerTwo.width = canvas.width / 80;
	playerTwo.height = canvas.height / 6;
	playerTwo.gravity = 2;

}

