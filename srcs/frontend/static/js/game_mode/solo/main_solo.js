import { firstPaddleSolo, ballSoloStyle, drawDashedLineSolo } from './style.js';


//----------------------GLOBAL GAME ELEMENT----------------------------//
let canvasSolo;
let contextSolo;
let ratioWidthSolo;
let ratioHeightSolo;
// let playerOneSolo;
let playerOneSolo;
let ballSolo;
let controllerSolo;

function init_canvasSolo(){
	canvasSolo = document.getElementById("pongGame");
	contextSolo = canvasSolo.getContext("2d");
	canvasSolo.width = window.innerWidth;
	canvasSolo.height = window.innerHeight * 0.94;
	ratioWidthSolo = window.innerWidth / canvasSolo.width;
	ratioHeightSolo = window.innerHeight / canvasSolo.height;

	//----------------------------OBJET--------------------------------//

	//first paddle right side
	playerOneSolo = new Element({
		x: canvasSolo.width - 20,
		y: canvasSolo.height * 0.4,
		width: canvasSolo.width / 80,
		height: canvasSolo.height / 6,
		color: "#3B2077",
		gravity: 2,
	})

	//ballSolo
	ballSolo = new Element({
		x: canvasSolo.width / 2,
		y: canvasSolo.height / 2,
		width: 15 * ratioWidthSolo,
		height: 15 * ratioHeightSolo,
		color: "#c480da",
		speed: 30,
		gravity: 2,
	})

	controllerSolo = {
		"o": {pressedSolo: false, func: movePaddleUpP2Solo},
		"l": {pressedSolo: false, func: movePaddleDownP2Solo},
		}
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

const keyDownHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = true;
	}
}

const keyUpHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = false;
	}
}

const executeMovesSolo = () => {
	Object.keys(controllerSolo).forEach(key=> {
		controllerSolo[key].pressedSolo && controllerSolo[key].func()
	})}

function movePaddleUpP2Solo() {
	if (controllerSolo["o"].pressedSolo == true && playerOneSolo.y - playerOneSolo.gravity > 0)
		playerOneSolo.y -= playerOneSolo.gravity * 7;
}

function movePaddleDownP2Solo() {
	if (controllerSolo["l"].pressedSolo == true && playerOneSolo.y + playerOneSolo.height + playerOneSolo.gravity < canvasSolo.height)
		playerOneSolo.y += playerOneSolo.gravity * 7;
}


//----------------------------METHOD--------------------------------//

//if we move the window, we resize object on the canvasSolo
window.addEventListener('resize', resizeCanvasSolo);

function resizeCanvasSolo() {
	const ratioWidthSolo = window.innerWidth / canvasSolo.width;
	const ratioHeightSolo = window.innerHeight / canvasSolo.height;
	canvasSolo.width = window.innerWidth;
	canvasSolo.height = window.innerHeight * 0.94;
	playerOneSolo.update({
		x: canvasSolo.width - 20,
		y: canvasSolo.height * 0.4,
		width: canvasSolo.width / 80,
		height: canvasSolo.height / 6,
	})
	ballSolo.update({
		width: 15 * ratioWidthSolo,
		height: 15 * ratioHeightSolo,
	})

	ballSoloBounce();
}

//draw elements
function drawElement(element){
	contextSolo.fillStyle = element.color;
	contextSolo.fillRect(element.x, element.y, element.width, element.height);
}

//make ballSolo bounce
function ballSoloBounce(){
	if(ballSolo.y + ballSolo.gravity <= 0 || ballSolo.y + ballSolo.gravity >= canvasSolo.height){
		ballSolo.gravity = ballSolo.gravity * (-1);
		ballSolo.y += ballSolo.gravity;
		ballSolo.x += ballSolo.speed;
	} else if (ballSolo.x <= 0) {
		ballSolo.speed = ballSolo.speed * (-1);
		ballSolo.y += ballSolo.gravity;
    	ballSolo.x += ballSolo.speed;
	}
	else
	{
		ballSolo.y += ballSolo.gravity;
		ballSolo.x += ballSolo.speed;
	}
	ballSoloWallCollision();
}

function ballSoloWallCollision(){
	if ((ballSolo.y + ballSolo.gravity <= playerOneSolo.y + playerOneSolo.height
			&& ballSolo.x + ballSolo.width + ballSolo.speed >= playerOneSolo.x
			&& ballSolo.y + ballSolo.gravity > playerOneSolo.y))
	{
		ballSolo.speed = ballSolo.speed * (-1);
	}
	if (ballSolo.x + ballSolo.speed > playerOneSolo.x + playerOneSolo.width)
	{
		resetBallSolo();
	}
	drawElementsSolo();
}

function resetBallSolo() {
    ballSolo.x = canvasSolo.width / 2;
    ballSolo.y = canvasSolo.height / 2;
    ballSolo.speed = Math.abs(ballSolo.speed) * (Math.random() > 0.5 ? 1 : -1); // Changer la direction aléatoirement
    ballSolo.gravity = Math.abs(ballSolo.gravity) * (Math.random() > 0.5 ? 1 : -1);
}

function drawElementsSolo(){
	contextSolo.clearRect(0, 0, canvasSolo.width, canvasSolo.height);
	firstPaddleSolo(contextSolo, playerOneSolo);
	ballSoloStyle(contextSolo, ballSolo);
	drawDashedLineSolo(contextSolo, canvasSolo);
}

export function resetGameSolo()
{
	playerOneSolo.x = canvasSolo.width - 20;
	playerOneSolo.y = canvasSolo.height * 0.4;
	playerOneSolo.width = canvasSolo.width / 80;
	playerOneSolo.height = canvasSolo.height / 6;
	playerOneSolo.gravity = 2;

	ballSolo.x = canvasSolo.width / 2;
	ballSolo.y = canvasSolo.height / 2;
	ballSolo.width = 15 * ratioWidthSolo;
	ballSolo.height = 15 * ratioHeightSolo;
	ballSolo.speed = 10;
	ballSolo.gravity = 3;

	canvasSolo.width = window.innerWidth;
	canvasSolo.height = window.innerHeight * 0.94;
	ratioWidthSolo = window.innerWidth / canvasSolo.width;
	ratioHeightSolo = window.innerHeight / canvasSolo.height;

	controllerSolo = {
		"o": {pressedSolo: false, func: movePaddleUpP2Solo},
		"l": {pressedSolo: false, func: movePaddleDownP2Solo},
		}
	window.addEventListener("keydown", keyDownHandlerSolo);
	window.addEventListener("keyup", keyUpHandlerSolo);
}

let animationId = null;

function loopSolo(){
	ballSoloBounce();
	executeMovesSolo();
	animationId = requestAnimationFrame(loopSolo);
}

export function soloMode(){
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	init_canvasSolo();
	resetGameSolo();
	loopSolo();
}

export function stopGameSolo() {
	window.removeEventListener("keydown", keyDownHandlerSolo);
	window.removeEventListener("keyup", keyUpHandlerSolo);
	window.removeEventListener('resize', resizeCanvasSolo);
}
