//KEY CONTROL

export function handleKeyPress(e, playerOne, canvas)
{
	const key = e.key;
	if ( key == "o" && playerOne.y-playerOne.gravity > 0){
		playerOne.y -= playerOne.gravity * 7;
	}
	else if (key == "l" && playerOne.y + playerOne.height + playerOne.gravity < canvas.height){
		playerOne.y += playerOne.gravity * 7;
	}
}