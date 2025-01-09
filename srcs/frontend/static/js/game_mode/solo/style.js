//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddleSolo(contextSolo, elementSolo)
{
	contextSolo.fillStyle = elementSolo.color;
	contextSolo.shadowColor = "rgba(0, 125, 255, 0.7)";
	contextSolo.shadowOffsetX = -3;
	contextSolo.shadowOffsetY = 1;
	contextSolo.shadowBlur = 6;

	contextSolo.fillRect(elementSolo.x, elementSolo.y, elementSolo.width, elementSolo.height);
	resetStyleSolo(contextSolo);
}

//ballSolo -> ronde + couleur + ombre
export function ballSoloStyle(contextSolo, elementSolo)
{
	contextSolo.fillStyle = elementSolo.color;
	contextSolo.shadowColor = "rgba(0, 125, 255, 0.7)";
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 6;

	contextSolo.beginPath();
    contextSolo.arc(
        elementSolo.x + elementSolo.width / 2, // Centre X
        elementSolo.y + elementSolo.height / 2, // Centre Y
        elementSolo.width / 1.5, // Rayon
        0, // Début de l'angle
        Math.PI * 2 // Fin de l'angle (cercle complet)
    );
    contextSolo.fill();
	resetStyleSolo(contextSolo);
}

export function drawDashedLineSolo(contextSolo, canvasSolo) {
    const dashLength = 20;  // Longueur des segments de la ligne pointillée
    const spaceLength = 10; // Longueur des espaces entre les segments
    const centerX = canvasSolo.width / 2;  // X du centre de la ligne
    const startY = 0;  // Début de la ligne (haut de l'écran)
    const endY = canvasSolo.height;  // Fin de la ligne (bas de l'écran)

    // Configuration de la couleur et de la largeur de la ligne
    contextSolo.strokeStyle = "#fff";  // Blanc
    contextSolo.lineWidth = 2;  // Largeur de la ligne

    // Calculer le nombre de segments nécessaires
    let currentY = startY;

    // Commencer à dessiner la ligne
    contextSolo.beginPath();

    while (currentY < endY) {
        // Dessiner un segment
        contextSolo.moveTo(centerX, currentY);
        contextSolo.lineTo(centerX, currentY + dashLength);

        // Avancer à la position suivante (pour le prochain segment)
        currentY += dashLength + spaceLength;  // Ajouter un segment + un espace
    }

    // Appliquer le tracé
    contextSolo.stroke();
}


function resetStyleSolo(contextSolo)
{
	contextSolo.shadowColor = "transparent";
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 0;
}