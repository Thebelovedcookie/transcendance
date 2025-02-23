//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function multiPaddle(context, element, canvas_info)
{
	context.strokeStyle = element.color;
	context.lineWidth = element.width; // Largeur de la raquette
	context.lineCap = "round"; // Arrondir les extrémités

	context.beginPath();
	context.arc(
		canvas_info.centerX,  // Centre de l'arène
		canvas_info.centerY,  // Centre de l'arène
		canvas_info.radius,   // Distance du centre (rayon)
		element.startAngle, // Angle de début (en radians)
		element.endAngle   // Angle de fin
	);
	context.stroke();
	context.closePath();
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
	const centerX = canvas.centerX;
	const centerY = canvas.centerY;
	const radius = canvas.radius;  // Rayon du cercle
	const dashLength = canvas.size;  // Longueur des segments
	const spaceLength = canvas.size * 2 / 3; // Longueur des espaces

	context.strokeStyle = "black";//'blue";
	context.lineWidth = 1;
	context.setLineDash([dashLength, spaceLength]); // Activer les pointillés

	// Dessiner les 3 lignes à 120° d'écart
	for (let i = 0; i < 3; i++) {
		if (i == 1)
			context.strokeStyle = "black";//"red";
		if (i == 2)
			context.strokeStyle = "black";//"green";
		const angle = (i * 2 * Math.PI) / 3;  // 0°, 120°, 240°
		const endX = centerX + Math.cos(angle) * radius;
		const endY = centerY + Math.sin(angle) * radius;

		context.beginPath();
		context.moveTo(centerX, centerY);
		context.lineTo(endX, endY);
		context.stroke();
	}

	// Réinitialiser les pointillés pour éviter d'affecter d'autres dessins
	context.setLineDash([]);
}

//----------------------------TEXTE--------------------------------//

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas) {
	const size = Math.round(canvas.dim / 15);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "red";
	context.textAlign = "right"
	context.textBaseline = "bottom";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, (canvas.dim * 0.95), canvas.dim - size);
	resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	const size = Math.round(canvas.dim / 15);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "blue";
	context.textBaseline = "bottom";
	context.textAlign = "left"
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, (canvas.dim * 0.05) , canvas.dim - size);
	resetStyle(context);
}

//PlayerThree score Text
export function displayScoreThree(context, scoreThree, canvas){
	const size = Math.round(canvas.dim / 15);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "green";
	context.textBaseline = "top";
	context.textAlign = "right"
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreThree, (canvas.dim * 0.95) , size);
	resetStyle(context);
}

export function displayPlayerName(context, canvas)
{
	const size = Math.round(canvas.dim / 40);
	context.font = size + "px 'Press Start 2P'";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;

	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillStyle = "black";
	context.fillText('Pause game: Esc', size, size);

	context.textAlign = "right";
	context.textBaseline = "bottom";
	context.fillStyle = "red";
	context.fillText('P1: ← (left) → (right)', canvas.dim - size, canvas.dim - size);

	context.textAlign = "left";
	context.textBaseline = "bottom";
	context.fillStyle = "blue";
	context.fillText("P2: w (up) s (down)", size, canvas.dim - size);

	context.textAlign = "right";
	context.textBaseline = "top";
	context.fillStyle = "green";
	context.fillText("P3: b (left) n (right)", canvas.dim - size, size);

	resetStyle(context);
}

export function drawWalls(context, canvas_info) {
	context.fillStyle = "rgb(78, 78, 78)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = canvas_info.size / 2;

	// Top wall
	context.fillRect(0, 0, canvas_info.dim, canvas_info.size);

	// Bottom wall
	context.fillRect(0, canvas_info.dim - canvas_info.size, canvas_info.dim, canvas_info.size);

	context.fillStyle = "rgba(78, 78, 78, 0.48)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// left wall
	context.fillRect(0, 0, canvas_info.size, canvas_info.dim);

	// Right wall
	context.fillRect(canvas_info.dim - canvas_info.size, 0, canvas_info.size, canvas_info.dim);

	resetStyle(context);
}

function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
