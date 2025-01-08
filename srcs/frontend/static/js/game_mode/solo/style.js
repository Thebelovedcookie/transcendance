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


//----------------------------TEXTE--------------------------------//

// let scaleFactorSolo = 1;
// let scalingUpSolo = true;

// //PlayerOne score Text
// export function displayScoreOne(contextSolo, scoreOne, canvasSolo) {
// 	if (scalingUpSolo) {
// 		scaleFactorSolo += 0.001; // Augmente la taille
// 		if (scaleFactorSolo >= 1.1) scalingUpSolo = false; // Arrête l'agrandissement
// 	} else {
// 		scaleFactorSolo -= 0.01; // Diminue la taille
//     if (scaleFactorSolo <= 1) scalingUpSolo = true; // Arrête la réduction
//   }

//   contextSolo.font = `${30 * scaleFactorSolo}px 'Arial', sans-serif`;
//   contextSolo.fillStyle = "#9f53ec";
//   contextSolo.textBaseline = "top";
//   contextSolo.shadowColor = "rgba(0, 125, 255, 255)";
//   contextSolo.shadowOffsetX = 1;
//   contextSolo.shadowOffsetY = 0;
//   contextSolo.shadowBlur = 3;
//   contextSolo.fillText(scoreOne, canvasSolo.width / 2 - 60, 30);
//   resetStyleSolo(contextSolo);
// }

// //PlayerTwo score Text
// export function displayScoreTwo(contextSolo, scoreTwo, canvasSolo){
// 	if (scalingUpSolo) {
// 		scaleFactorSolo += 0.001; // Augmente la taille
// 	if (scaleFactorSolo >= 1.1) scalingUpSolo = false; // Arrête l'agrandissement
// 	} else {
// 		scaleFactorSolo -= 0.01; // Diminue la taille
// 		if (scaleFactorSolo <= 1) scalingUpSolo = true; // Arrête la réduction
// 	}
	
// 	contextSolo.font = `${30 * scaleFactorSolo}px 'Arial', sans-serif`;
// 	contextSolo.fillStyle = "#9f53ec";
// 	contextSolo.textBaseline = "top";
// 	contextSolo.shadowColor = "rgba(0, 125, 255, 255)";
// 	contextSolo.shadowOffsetX = -1;
// 	contextSolo.shadowOffsetY = 0;
// 	contextSolo.shadowBlur = 3;
// 	contextSolo.fillText(scoreTwo, canvasSolo.width / 2 + 45, 30);
// 	resetStyleSolo(contextSolo);
// }
	
function resetStyleSolo(contextSolo)
{
	contextSolo.shadowColor = "transparent";
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 0;
}