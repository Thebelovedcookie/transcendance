import { handleKeyPress } from './key_movement_solo.js';
import { firstPaddle, ballStyle, displayScoreOne, displayScoreTwo } from './style.js';


//----------------------GLOBAL GAME ELEMENT----------------------------//
let canvas;
let context;
let ratioWidth;
let ratioHeight;
// let playerOne;
let playerOne;
let ball;
let middle;

function init_canvas(){
	canvas = document.getElementById("pongGame");
	context = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	ratioWidth = window.innerWidth / canvas.width;
	ratioHeight = window.innerHeight / canvas.height;

	//----------------------------OBJET--------------------------------//
	
	//first paddle right side
	playerOne = new Element({
		x: canvas.width - 20,
		y: canvas.height * 0.4,
		width: canvas.width / 80,
		height: canvas.height / 6,
		color: "#3B2077",
		gravity: 2,
	})

	//ball
	ball = new Element({
		x: canvas.width / 2,
		y: canvas.height / 2,
		width: 15 * ratioWidth,
		height: 15 * ratioHeight,
		color: "#c480da",
		speed: 30,
		gravity: 2,
	})

	//bar au milieu
	middle = new Element({
		x: canvas.width/2,
		y: 0,
		width: 1,
		height: canvas.height,
		color: "#fff",
		gravity: 1,
	})
}

//----------------------------CLASS--------------------------------//

class Element{
	constructor(options){
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed || 2;
		this.gravity = options.gravity;
	}

	update({ x, y, width, height, speed }) {
		this.x = x !== undefined ? x : this.x;
		this.y = y !== undefined ? y : this.y;
		this.width = width !== undefined ? width : this.width;
		this.height = height !== undefined ? height : this.height;
		this.speed = speed !== undefined ? speed : this.speed;
	}
}




//----------------------------KEY MOVEMENT--------------------------------//

const keyPressListener = (e) => handleKeyPress(e, playerOne, canvas);

// Ajouter l'écouteur
window.addEventListener("keypress", keyPressListener, false);

//----------------------------METHOD--------------------------------//

//if we move the window, we resize object on the canvas
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
	const ratioWidth = window.innerWidth / canvas.width;
	const ratioHeight = window.innerHeight / canvas.height;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	middle.update({
		x: canvas.width / 2,
		height: canvas.height,
	});
	playerOne.update({
		x: canvas.width - 20,
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
	} else if (ball.x <= 0) { 
		ball.speed = ball.speed * (-1);
		ball.y += ball.gravity;
    	ball.x += ball.speed;
	}
	else
	{
		ball.y += ball.gravity;
		ball.x += ball.speed;
	}
	ballWallCollision();
}

function ballWallCollision(){
	if ((ball.y + ball.gravity <= playerOne.y + playerOne.height
			&& ball.x + ball.width + ball.speed >= playerOne.x
			&& ball.y + ball.gravity > playerOne.y))
	{
		ball.speed = ball.speed * (-1);
	} 
	if (ball.x + ball.speed > playerOne.x + playerOne.width)
	{
		// scoreOne++;
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
	ballStyle(context, ball);
	drawElement(middle);
	// displayScoreOne(context, scoreOne, canvas);
	// displayScoreTwo(context, scoreTwo, canvas);
}

export function resetGame()
{
	playerOne.x = canvas.width - 20;
	playerOne.y = canvas.height * 0.4;
	playerOne.width = canvas.width / 80;
	playerOne.height = canvas.height / 6;
	playerOne.gravity = 2;

	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.width = 15 * ratioWidth;
	ball.height = 15 * ratioHeight;
	ball.speed = 8;
	ball.gravity = 3;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	ratioWidth = window.innerWidth / canvas.width;
	ratioHeight = window.innerHeight / canvas.height;
}

let animationId = null;

function loop(){
	ballBounce();
	animationId = requestAnimationFrame(loop);
}

export function soloMode(){
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	init_canvas();
	resetGame();
	loop();
}

export function stopGameSolo() {
	window.removeEventListener("keypress", keyPressListener, false);
	window.removeEventListener('resize', resizeCanvas);
}
