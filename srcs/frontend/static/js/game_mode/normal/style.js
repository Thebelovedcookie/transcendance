//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(255, 0, 255, 0.7)";
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 10;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//raquette playerTwo
export function secondPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 125, 255, 0.7)";
	context.shadowOffsetX = -3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 6;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//ball -> ronde + couleur + ombre
export function ballStyle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 125, 255, 0.7)";
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
	resetStyle(context);
}

export function drawDashedLine(context, canvas) {
    const dashLength = 20;  // Longueur des segments de la ligne pointillée
    const spaceLength = 10; // Longueur des espaces entre les segments
    const centerX = canvas.width / 2;  // X du centre de la ligne
    const startY = 0;  // Début de la ligne (haut de l'écran)
    const endY = canvas.height;  // Fin de la ligne (bas de l'écran)

    // Configuration de la couleur et de la largeur de la ligne
    context.strokeStyle = "#fff";  // Blanc
    context.lineWidth = 2;  // Largeur de la ligne

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
}

//----------------------------TEXTE--------------------------------//

let scaleFactor = 1;
let scalingUp = true;

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas) {
	if (scalingUp) {
		scaleFactor += 0.001; // Augmente la taille
		if (scaleFactor >= 1.1) scalingUp = false; // Arrête l'agrandissement
	} else {
		scaleFactor -= 0.01; // Diminue la taille
    if (scaleFactor <= 1) scalingUp = true; // Arrête la réduction
  }

  context.font = `${30 * scaleFactor}px 'Arial', sans-serif`;
  context.fillStyle = "#9f53ec";
  context.textBaseline = "top";
  context.shadowColor = "rgba(0, 125, 255, 255)";
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 0;
  context.shadowBlur = 3;
  context.fillText(scoreOne, canvas.width / 2 - 60, 30);
  resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	if (scalingUp) {
		scaleFactor += 0.001; // Augmente la taille
	if (scaleFactor >= 1.1) scalingUp = false; // Arrête l'agrandissement
	} else {
		scaleFactor -= 0.01; // Diminue la taille
		if (scaleFactor <= 1) scalingUp = true; // Arrête la réduction
	}
	
	context.font = `${30 * scaleFactor}px 'Arial', sans-serif`;
	context.fillStyle = "#9f53ec";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 125, 255, 255)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, canvas.width / 2 + 45, 30);
	resetStyle(context);
}
	
function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}