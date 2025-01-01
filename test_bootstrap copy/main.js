import { handleKeyPress } from './key_movement.js';

const canvas = document.getElementById("pongGame");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ratioWidth = window.innerWidth / canvas.width;
let ratioHeight = window.innerHeight / canvas.height;

//----------------------------CLASS --------------------------------//

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

//----------------------------OBJET--------------------------------//
//first paddle
const playerOne = new Element({
	x: 5,
	y: canvas.height * 0.4,
	width: canvas.width / 80,
	height: canvas.height / 6,
	color: "#3B2077",
	gravity: 2,
})

//second paddle
const playerTwo = new Element({
	x: canvas.width - 20,
	y: canvas.height * 0.4,
	width: canvas.width / 80,
	height: canvas.height / 6,
	color: "#3B2077",
	gravity: 2,
})

//ball
const ball = new Element({
	x: canvas.width / 2,
	y: canvas.height / 2,
	width: 15 * ratioWidth,
	height: 15 * ratioHeight,
	color: "#c480da",
	speed: 3,
	gravity: 2,
})

//bar au milieu
const middle = new Element({
	x: canvas.width/2,
	y: 0,
	width: 1,
	height: canvas.height,
	color: "#fff",
	gravity: 1,
})


window.addEventListener('resize', resizeCanvas);

let scoreOne = 0;
let scoreTwo = 0;

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
		y: canvas.height * 0.4,
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
	console.log("ballbounce");
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
	console.log("ballWallCollision");
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
		// endOfGame();
		resetBall();
	} else if (ball.x + ball.speed > playerTwo.x + playerTwo.width)
	{
		scoreOne++;
		// endOfGame();
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

//PlayerOne score Text
function displayScoreOne(scoreOne) {

  context.font = "30px 'Arial', sans-serif";
  context.fillStyle = "#9f53ec";
  context.fillText(scoreOne, 50, 50);
}

//PlayerTwo score Text
function displayScoreTwo(scoreTwo){
	
	context.font = "30px 'Arial', sans-serif";
	context.fillStyle = "#9f53ec";
	context.fillText(scoreTwo, 50, 50);
}

function drawElements(){
	console.log("drawElements");
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawElement(playerOne);
	drawElement(playerTwo);
	drawElement(ball);
	drawElement(middle);
	displayScoreOne(scoreOne);
	displayScoreTwo(scoreTwo);
}

export function resetGame()
{
	playerOne.x = 5;
	playerOne.y= canvas.height * 0.4;
	playerOne.width= canvas.width / 80;
	playerOne.height= canvas.height / 6;
	playerOne.gravity= 2;


	playerTwo.x= canvas.width - 20;
	playerTwo.y= canvas.height * 0.4;
	playerTwo.width= canvas.width / 80;
	playerTwo.height= canvas.height / 6;
	playerTwo.gravity= 2;

	ball.x= canvas.width / 2;
	ball.y= canvas.height / 2;
	ball.width= 15 * ratioWidth;
	ball.height= 15 * ratioHeight;
	ball.speed= 3;
	ball.gravity= 2;

	scoreOne = 0;
	scoreTwo = 0;

	// canvas = document.getElementById("pongGame");
	// context = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ratioWidth = window.innerWidth / canvas.width;
	ratioHeight = window.innerHeight / canvas.height;
}

export function loop(){

	console.log("canvas = ", canvas.width, canvas.height);
	ballBounce();
	window.requestAnimationFrame(loop);
}

loop();