//KEY CONTROL

export function handleKeyPress(e, playerOne, playerTwo, canvas)
{
	const key = e.key;
	if ( key == "w" && playerOne.y-playerOne.gravity > 0){
		playerOne.y -= playerOne.gravity * 4;
	}
	else if (key == "s" && playerOne.y + playerOne.height + playerOne.gravity < canvas.height){
		playerOne.y += playerOne.gravity * 4;
	}

	if ( key == "o" && playerTwo.y-playerTwo.gravity > 0){
		playerTwo.y -= playerTwo.gravity * 4;
	}
	else if (key == "l" && playerTwo.y + playerTwo.height + playerTwo.gravity < canvas.height){
		playerTwo.y += playerTwo.gravity * 4;
	}
}