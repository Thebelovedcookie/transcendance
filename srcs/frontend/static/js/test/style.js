//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddle(context, element)
{
	console.log("j'affiche");
	context.fillRect(element.x, element.y, element.width, element.height);
}

//raquette playerTwo
export function secondPaddle(context, element)
{
	context.fillRect(element.x, element.y, element.width, element.height);
}

//ball -> ronde + couleur + ombre
export function ballStyle(context, element)
{
	context.beginPath();
    context.arc(
        element.x + element.width / 2, // Centre X
        element.y + element.height / 2, // Centre Y
        element.width / 1.50, // Rayon
        0, // Début de l'angle
        Math.PI * 2 // Fin de l'angle (cercle complet)
    );
    context.fill();
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

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas) {

	context.font = "90px 'Press Start 2P'";
  	context.fillStyle = "#FFFFFF";
  	context.textBaseline = "top";

	context.fillText(scoreOne, canvas.width / 2 - 120, 30);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	
	context.font = "90px 'Press Start 2P'";
	context.fillStyle = "#FFFFFF";
	context.textBaseline = "top";
	
	context.fillText(scoreTwo, canvas.width / 2 + 60, 30);
}
	
