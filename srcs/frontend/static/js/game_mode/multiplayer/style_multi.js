//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function multiPaddle(context, element)
{
	context.strokeStyle = element.color;
	context.lineWidth = element.width; // Largeur de la raquette
	context.lineCap = "round"; // Arrondir les extrémités

	context.beginPath();
	context.arc(
		element.centerX,  // Centre de l'arène
		element.centerY,  // Centre de l'arène
		element.radius,   // Distance du centre (rayon)
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
        element.x + element.width / 2, // Centre X
        element.y + element.height / 2, // Centre Y
        element.width / 1.50, // Rayon
        0, // Début de l'angle
        Math.PI * 2 // Fin de l'angle (cercle complet)
    );
    context.fill();
	// resetStyle(context);
}

export function drawDashedLine(context, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.height / 2;  // Rayon du cercle
    const dashLength = 15;  // Longueur des segments
    const spaceLength = 10; // Longueur des espaces

    context.strokeStyle = "blue";  
    context.lineWidth = 2;  
    context.setLineDash([dashLength, spaceLength]); // Activer les pointillés

    // Dessiner les 3 lignes à 120° d'écart
    for (let i = 0; i < 3; i++) {
		if (i == 1)
			context.strokeStyle = "red";
		if (i == 2)
			context.strokeStyle = "green";
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
	const size = Math.round(canvas.width / 10);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "red";
	context.textAlign = "right"
	context.textBaseline = "bottom";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, (canvas.width * 0.95), canvas.height - 20);
	resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	const size = Math.round(canvas.width / 10);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "blue";
	context.textBaseline = "bottom";
	context.textAlign = "left"
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, (canvas.width * 0.05) , canvas.height - 20);
	resetStyle(context);
}

//PlayerThree score Text
export function displayScoreThree(context, scoreThree, canvas){
	const size = Math.round(canvas.width / 10);
	context.font = size + "px 'Press Start 2P'";
	context.fillStyle = "green";
	context.textBaseline = "top";
	context.textAlign = "right"
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreThree, (canvas.width * 0.95) , 30);
	resetStyle(context);
}

export function displayPlayerName(context, canvas)
{
	const size = Math.round(canvas.width / 40);
	context.font = size + "px 'Press Start 2P'";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;

	context.textAlign = "right";
	context.fillStyle = "red";
    context.fillText('P1: ← (left) → (right)', canvas.width - 30, canvas.width - 30);

	context.textAlign = "left";
	context.fillStyle = "blue";
    context.fillText("P2: w (up) s (down)", 30, canvas.width - 30);

    context.textAlign = "right";
	context.fillStyle = "green";
    context.fillText("P3: b (left) n (right)", canvas.width - 30, 10);

	resetStyle(context);
}

export function drawWalls(context, canvas) {
	context.fillStyle = "rgb(78, 78, 78)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// Top wall
	context.fillRect(0, 0, canvas.width, 5);

	// Bottom wall
	context.fillRect(0, canvas.height - 5, canvas.width, 5);

	context.fillStyle = "rgba(78, 78, 78, 0.48)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// left wall
	context.fillRect(0, 0, 5, canvas.height);

	// Right wall
	context.fillRect(canvas.width - 5, 0, 5, canvas.height);

	resetStyle(context);
}

function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
