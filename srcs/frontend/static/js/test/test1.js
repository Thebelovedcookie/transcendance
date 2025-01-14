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
let myAudio = null;
let BipWall = null;

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
	color: "#FFFFFF",
	gravity: 2,
	})
	
	//second paddle
	playerTwo = new Element({
		x: canvas.width - 20,
		y: canvas.height * 0.4,
		width: canvas.width / 80,
		height: canvas.height / 6,
		color: "#FFFFFF",
		gravity: 2,
	})

	//ball
	ball = new Element({
		x: canvas.width / 2,
		y: canvas.height / 2,
		width: 15 * ratioWidth,
		height: 15 * ratioHeight,
		color: "#FFFFFF",
		speed: 30,
		gravity: 2,
	})

	controller = {
		"w": {pressed: false},
		"s": {pressed: false},
		"o": {pressed: false},
		"l": {pressed: false},
		}
}

//----------------------------CLASS --------------------------------//

//creating the classx element
//so paddle 1/2 and ball will be element type
//the function update allows us to update the size according to the window size
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

//Our buttin have two state
//pressed or unpressed 
//so we have a booleen -> pressed=false or true

//if true is pressed, the the paddle will moove until pressed goes back to false

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
}

//draw all element(paddle1/2, ball, score)
function drawElements(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	firstPaddle(context, playerOne);
	secondPaddle(context, playerTwo);
	ballStyle(context, ball);
	drawDashedLine(context, canvas);
	displayScoreOne(context, scoreOne, canvas);
	displayScoreTwo(context, scoreTwo, canvas);
}

// everything goes back as his first position
// starting the listener of both paddle movement
// adding the sound played for bouncing moment
export function resetGame()
{
	playerOne.x = 5;
	playerOne.y = canvas.height * 0.4;
	playerOne.width = canvas.width / 90;
	playerOne.height = canvas.height / 10;
	playerOne.gravity = 2;


	playerTwo.x = canvas.width - 20;
	playerTwo.y = canvas.height * 0.4;
	playerTwo.width = canvas.width / 90;
	playerTwo.height = canvas.height / 10;
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
		"w": {pressed: false},
		"s": {pressed: false},
		"o": {pressed: false},
		"l": {pressed: false},
	}

	window.addEventListener("keydown", keyDownHandler);
	window.addEventListener("keyup", keyUpHandler);
	myAudio = new Audio('/static/js/game_mode/normal/bipPaddle.mp3');
	BipWall = new Audio('/static/js/game_mode/normal/bipWall.mp3');
}


//stopping the last animationID if he exist; Initialisation of the canvas; 
//reset the game entirely; Starting the game;
function normalMode(){
	drawElements();
}

let gameState;
function initGameState() {
	gameState = {
		player1: {
			x: playerOne.x,
			y: playerOne.y,
			width: playerOne.width,
			height: playerOne.height,
			color: "white",
			gravity: playerOne.gravity,
		},
		player2: {
			x: playerTwo.x,
			y: playerTwo.y,
			width: playerTwo.width,
			height: playerTwo.height,
			color: "white",
			gravity: playerTwo.gravity,
		},
		ball1: {
			x: ball.x,
			y: ball.y,
			width: ball.width,
			height: ball.height,
			color: "white", // Par exemple
			speed: ball.speed,
			gravity: ball.gravity,
		},
		canvas1: {
			height: canvas.height,
			width: canvas.width,
		},
		scores1: {
			playerOne: 0,
			playerTwo: 0,
		},
		p1up: controller["w"].pressed,
		p1down: controller["s"].pressed,
		p2up: controller["o"].pressed,
		p2down: controller["l"].pressed,
	};
}

function update(gameState)
{
	playerOne.x = gameState.player1.x;
	playerOne.y = gameState.player1.y;
	playerOne.height = gameState.player1.height;
	playerOne.width = gameState.player1.width;
	playerOne.gravity = gameState.player1.gravity;

	playerTwo.x = gameState.player2.x;
	playerTwo.y = gameState.player2.y;
	playerTwo.height = gameState.player2.height;
	playerTwo.width = gameState.player2.width;
	playerTwo.gravity = gameState.player2.gravity;

	ball.x = gameState.ball1.x;
	ball.y = gameState.ball1.y;
	ball.height = gameState.ball1.height;
	ball.width = gameState.ball1.width;
	ball.gravity = gameState.ball1.gravity;
	ball.speed = gameState.ball1.speed;
}

var exampleSocket = new WebSocket("ws://django:8000/api/");
  
export function startGame() {

	exampleSocket.onopen = function (event) {
		console.log("Connexion WebSocket établie !");
		
		// Préparer les données à envoyer
		const message = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gameState),
		};
	
		// Envoyer les données sous forme de chaîne JSON
		exampleSocket.send(JSON.stringify(message));
	};
	
	// Gestionnaire pour les messages reçus
	exampleSocket.onmessage = function (event) {
		console.log("Message reçu du serveur :", event.data);
	};
	
	// Gestionnaire pour les erreurs
	exampleSocket.onerror = function (event) {
		console.error("Erreur WebSocket :", event);
	};
	
	// Gestionnaire pour la fermeture de la connexion
	exampleSocket.onclose = function (event) {
		console.warn("Connexion WebSocket fermée :", event);
	};
}


// export function startGame() {
//     init_canvas();
//     resetGame();
//     initGameState();

//     console.log(playerOne.x);

//     const updateGame = () => {
//         // Envoyer la requête à l'API
//         fetch('http://localhost/api/', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(gameState),
//             timeout: 1000,
//         })
//             .then((response) => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then((data) => {

// 				console.log(data.player1);
// 				console.log(data.player2);
//                 // Mettre à jour l'état du jeu avec les nouvelles données reçues
//                 gameState.player1 = data.player1;
//                 gameState.player2 = data.player2;
//                 gameState.ball1 = data.ball1;
//                 gameState.scores1 = data.scores1;

//                 // Mettre à jour le rendu du jeu
//                 update();
//                 normalMode();

//                 // Demander à ce que la fonction updateGame soit appelée à la prochaine frame
//                 requestAnimationFrame(updateGame);
//             })
//             .catch((error) => {
//                 console.error('Erreur lors de la requête:', error);

//                 // Replanifier l'appel à updateGame même en cas d'erreur pour ne pas bloquer le jeu
//             });
//     };

//     // Démarrer la boucle de mise à jour
//     updateGame();
// }


//Stopping the listener of the playerPaddle and the Resize canvas
export function stopGameNormal() {
	window.removeEventListener("keydown", keyDownHandler);
	window.removeEventListener("keyup", keyUpHandler);
	window.removeEventListener('resize', resizeCanvas);
}