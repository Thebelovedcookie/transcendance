//----------------------------COLOR/STYLE--------------------------------//

//raquette 
export function drawPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 10;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//ball -> ronde + couleur + ombre
export function ballStyle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	context.beginPath();
	context.arc(
		element.x + element.size / 2, // Centre X
		element.y + element.size / 2, // Centre Y
		element.size / 1.50, // Rayon
		0, // Début de l'angle
		Math.PI * 2 // Fin de l'angle (cercle complet)
	);
	context.fill();
	// resetStyle(context);
}

export function drawDashedLine(context, canvas) {
	var size = Math.round(canvas.width / 400);
	if (size < 1) {
		size = 1;
	}
	const dashLength = size * 5;  // Longueur des segments de la ligne pointillée
	const spaceLength = dashLength * 2 / 3; // Longueur des espaces entre les segments
	const centerX = canvas.width / 2;  // X du centre de la ligne
	const startY = 0;  // Début de la ligne (haut de l'écran)
	const endY = canvas.height;  // Fin de la ligne (bas de l'écran)

	// Configuration de la couleur et de la largeur de la ligne
	context.strokeStyle = "black";  // Blanc
	context.lineWidth = size;  // Largeur de la ligne

	// Calculer le nombre de segments nécessaires
	let currentY = startY;

	// Commencer à dessiner la ligne
	context.beginPath();

	while (currentY < endY) {
		// Dessiner un segment
		context.moveTo(centerX, currentY);
		context.lineTo(centerX, currentY + dashLength);

		// Avancer à la position suivante (pour le prochain segment)
		currentY += dashLength + spaceLength;  // Ajouter un segment + un espace
	}

	// Appliquer le tracé
	context.stroke();
	// resetStyle(context);
}

//----------------------------TEXTE--------------------------------//

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas) {
	const size = Math.round(canvas.width / 25);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, (canvas.width / 2) - (canvas.width / 8), size / 2);
	resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	const size = Math.round(canvas.width / 25);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, (canvas.width / 2) + (canvas.width / 8) + 1.5 * size, size / 2);
	resetStyle(context);
}

export function displayText(context, canvas)
{
	const size = Math.round(canvas.width / 50);
	context.font = size + "px 'Press Start 2P'";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;

	context.textAlign = "left";
	context.textBaseline = "bottom";
	context.fillStyle = "rgb(78, 78, 78)";
	context.fillText('Pause game: Esc', size, canvas.height - size);

	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillStyle = "black";
	context.fillText('Human: w (up) s (down)', size, size);

	context.textAlign = "right";
	context.textBaseline = "top";
	context.fillStyle = "black";
	context.fillText("AI player", canvas.width - size, size);

	resetStyle(context);
}

export function drawWalls(context, canvas) {
	var size = Math.round(canvas.width / 200);
	if (size < 1) {
		size = 1;
	}
	context.fillStyle = "rgb(78, 78, 78)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// Top wall
	context.fillRect(0, 0, canvas.width, size);

	// Bottom wall
	context.fillRect(0, canvas.height - size, canvas.width, size);

	context.fillStyle = "rgba(78, 78, 78, 0.48)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// left wall
	context.fillRect(0, 0, size, canvas.height);

	// Right wall
	context.fillRect(canvas.width - size, 0, size, canvas.height);

	resetStyle(context);
}

function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
