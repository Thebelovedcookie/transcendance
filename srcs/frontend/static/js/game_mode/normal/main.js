// import { executeMoves} from './key_movement.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo } from './style.js';


//----------------------GLOBAL GAME ELEMENT----------------------------//
let canvas;
let context;
let ratioWidth;
let ratioHeight;
let playerOne;
let playerTwo;
let ball;
let scoreOne = 0;
let scoreTwo = 0;
let controller;

function init_canvas(){
	canvas = document.getElementById("pongGame");
	context = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	ratioWidth = window.innerWidth / canvas.width;
	ratioHeight = window.innerHeight / canvas.height;

	//----------------------------OBJET--------------------------------//
	//first paddle
	playerOne = new Element({
	x: 5,
	y: canvas.height * 0.4,
	width: canvas.width / 80,
	height: canvas.height / 6,
	color: "#3B2077",
	gravity: 2,
	})
	
	//second paddle
	playerTwo = new Element({
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

	controller = {
		"w": {pressed: false, func: movePaddleUpP1},
		"s": {pressed: false, func: movePaddleDowP1},
		"o": {pressed: false, func: movePaddleUpP2},
		"l": {pressed: false, func: movePaddleDownP2},
		}
}

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

//----------------------------KEY MOVEMENT--------------------------------//


const keyDownHandler = (e) => {
	if (controller[e.key]) {
		controller[e.key].pressed = true;  
	}
}

const keyUpHandler = (e) => {
	if (controller[e.key]) {
		controller[e.key].pressed = false; 
	}
}

const executeMoves = () => {
	Object.keys(controller).forEach(key=> {
		controller[key].pressed && controller[key].func()
	})}

function movePaddleUpP1() {
	if (controller["w"].pressed == true && playerOne.y-playerOne.gravity > 0)
		playerOne.y -= playerOne.gravity * 7;
}

function movePaddleDowP1() {
	if (controller["s"].pressed == true && playerOne.y + playerOne.height + playerOne.gravity < canvas.height)
		playerOne.y += playerOne.gravity * 7;
}

function movePaddleUpP2() {
	if (controller["o"].pressed == true && playerTwo.y - playerTwo.gravity > 0)
		playerTwo.y -= playerTwo.gravity * 7;
}

function movePaddleDownP2() {
	if (controller["l"].pressed == true && playerTwo.y + playerTwo.height + playerTwo.gravity < canvas.height)
		playerTwo.y += playerTwo.gravity * 7;
}

//----------------------------METHOD--------------------------------//

//if we move the window, we resize object on the canvas
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
	const ratioWidth = window.innerWidth / canvas.width;
	const ratioHeight = window.innerHeight / canvas.height;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;

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
		resetBall();
	} else if (ball.x + ball.speed > playerTwo.x + playerTwo.width)
	{
		scoreOne++;
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
	drawDashedLine(context, canvas);
	displayScoreOne(context, scoreOne, canvas);
	displayScoreTwo(context, scoreTwo, canvas);
}

export function resetGame()
{
	playerOne.x = 5;
	playerOne.y = canvas.height * 0.4;
	playerOne.width = canvas.width / 80;
	playerOne.height = canvas.height / 6;
	playerOne.gravity = 2;


	playerTwo.x = canvas.width - 20;
	playerTwo.y = canvas.height * 0.4;
	playerTwo.width = canvas.width / 80;
	playerTwo.height = canvas.height / 6;
	playerTwo.gravity = 2;

	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.width = 15 * ratioWidth;
	ball.height = 15 * ratioHeight;
	ball.speed = 8;
	ball.gravity = 3;

	scoreOne = 0;
	scoreTwo = 0;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.94;
	ratioWidth = window.innerWidth / canvas.width;
	ratioHeight = window.innerHeight / canvas.height;

	controller = {
		"w": {pressed: false, func: movePaddleUpP1},
		"s": {pressed: false, func: movePaddleDowP1},
		"o": {pressed: false, func: movePaddleUpP2},
		"l": {pressed: false, func: movePaddleDownP2},
	}

	window.addEventListener("keydown", keyDownHandler);
	window.addEventListener("keyup", keyUpHandler);
}

let animationId = null;

function loop(){
	ballBounce();

	executeMoves();
	animationId = requestAnimationFrame(loop);
}

export function normalMode(){
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	init_canvas();
	resetGame();
	loop();
}

export function stopGameNormal() {
	window.removeEventListener("keydown", keyDownHandler);
	window.removeEventListener("keyup", keyUpHandler);
	window.removeEventListener('resize', resizeCanvas);
}