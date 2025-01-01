import { firstPaddle, secondPaddle, ballStyle, displayScoreOne, displayScoreTwo } from "./style.js";
import { canvas, context, ratioHeight, ratioWidth, playerOne, playerTwo, ball, middle } from "./class_object.js";
import { handleKeyPress } from './key_movement.js';

window.addEventListener('resize', resizeCanvas);

let scoreOne = 0;
let scoreTwo = 0;
let gameover = false;
let scoreMax = 1;

//----------------------------KEY MOVEMENT--------------------------------//

const keyPressListener = (e) => handleKeyPress(e, playerOne, playerTwo, canvas);

// Ajouter l'écouteur
window.addEventListener("keypress", keyPressListener, false);

//----------------------------METHOD--------------------------------//

function resizeCanvas() {
	const ratioWidth = window.innerWidth / canvas.width;
	const ratioHeight = window.innerHeight / canvas.height;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	middle.update({
		x: canvas.width / 2,
		height: canvas.height,
	});
	playerTwo.update({
		x: canvas.width - 20,
		y:canvas.height * 0.4,
		width: canvas.width / 80,
		height: canvas.height / 6,
	})
	playerOne.update({
		y: canvas.height * 0.4,
		width: canvas.width / 80,
		height: canvas.height / 6,
	})
	ball.update({
		width: 15 * ratioWidth,
		height: 15 * ratioHeight,
	})

	ballBounce();
}

//draw elements
function drawElement(element){
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

//make ball bounce
function ballBounce(){
	if(ball.y + ball.gravity <= 0 || ball.y + ball.gravity >= canvas.height){
		ball.gravity = ball.gravity * (-1);
		ball.y += ball.gravity;
		ball.x += ball.speed;
	} else {
		ball.y += ball.gravity;
		ball.x += ball.speed;
	}
	ballWallCollision();
}

function ballWallCollision(){
	if ((ball.y + ball.gravity <= playerTwo.y + playerTwo.height
			&& ball.x + ball.width + ball.speed >= playerTwo.x
			&& ball.y + ball.gravity > playerTwo.y) ||
			(ball.y + ball.gravity >= playerOne.y &&
			ball.y + ball.gravity <= playerOne.y + playerOne.height &&
			ball.x + ball.speed <= playerOne.x + playerOne.width))
	{
		ball.speed = ball.speed * (-1);
	} else if (ball.x + ball.speed < playerOne.x)
	{
		scoreTwo++;
		endOfGame();
		resetBall();
	} else if (ball.x + ball.speed > playerTwo.x + playerTwo.width)
	{
		scoreOne++;
		endOfGame();
		resetBall();
	}

	drawElements();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = Math.abs(ball.speed) * (Math.random() > 0.5 ? 1 : -1); // Changer la direction aléatoirement
    ball.gravity = Math.abs(ball.gravity) * (Math.random() > 0.5 ? 1 : -1);
}

function drawElements(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	firstPaddle(context, playerOne);
	secondPaddle(context, playerTwo);
	ballStyle(context, ball);
	drawElement(middle);
	displayScoreOne(context, scoreOne, canvas);
	displayScoreTwo(context, scoreTwo, canvas);
}

function endOfGame()
{
	if (scoreOne == scoreMax || scoreTwo == scoreMax){
		gameover = true;
	}
}

function displayWinner()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `50px 'Arial', sans-serif`;
    context.fillStyle = "#9f53ec";
    context.textAlign = "center";
	context.shadowColor = "rgba(0, 125, 255, 255)";
	context.shadowOffsetX = 4;
  	context.shadowOffsetY = 3;
  	context.shadowBlur = 5;
    context.fillText(
        scoreOne >= scoreMax ? "Player One Wins!" : "Player Two Wins!",
        canvas.width / 2,
        canvas.height / 2
    );
}

let lastTime = performance.now();
let animationId; // Identifiant de la boucle d'animation

export function loop(currentTime){

	if (gameover === true)
	{
		displayWinner();
		return;
	}
	if (lastTime === 0)
		lastTime = currentTime;
	if (currentTime === undefined)
		currentTime = performance.now();
	else
	{
		const deltaTime = currentTime - lastTime;
		ball.x += ball.speed * (deltaTime / 1000); // 16ms ≈ 60 FPS
		ball.y += ball.gravity * (deltaTime / 1000);

	}
	
	lastTime = currentTime;

	ballBounce();
	animationId = requestAnimationFrame(loop);
}

loop();