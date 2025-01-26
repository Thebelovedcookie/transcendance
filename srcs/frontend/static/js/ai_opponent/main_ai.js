import { EndNormalGamePage } from '../pages/EndNormalGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo } from './style_ai.js';
let canvas = null;
let context = null;
let theme = "base";

class GameAISocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = window.innerWidth;
		context.clearRect(0, 0, canvas.width, canvas.height);

		this.hitAiLine = false;
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.directionY = 0;
		this.keys = {
			w: false,
			s: false,
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
	}

	drawPredictedPath() {
		let predictionX = this.gameState.ball.x;
		let predictionY = this.gameState.ball.y;
		let predictionSpeedX = this.gameState.ball.speed;
		let predictionSpeedY = this.gameState.ball.gravity;
  
		context.strokeStyle = "rgba(204, 7, 0, 0.2)";
		context.lineWidth = 10;
		context.beginPath();
		context.moveTo(predictionX + this.gameState.ball.width / 2, predictionY + this.gameState.ball.height / 2); // Point de départ
  
		for (let i = 0; i < 45; i++) { // Simulate x step
			predictionX += predictionSpeedX;
			predictionY += predictionSpeedY;

			// Gestion des collisions avec les bords
			if (predictionX + this.gameState.ball.width > canvas.width || predictionX < 0) {
				predictionSpeedX *= -1; // Inverser direction X
			}
			if (predictionY + this.gameState.ball.height > canvas.height || predictionY < 0) {
				predictionSpeedY *= -0.9; // Inverser direction Y
				predictionY = predictionY + this.gameState.ball.height > canvas.height ? canvas.height - this.gameState.ball.height : predictionY;
			}
			
			// Tracer une ligne jusqu'à la position prédite
			context.lineTo(predictionX + this.gameState.ball.width / 2, predictionY + this.gameState.ball.height / 2);
			if (predictionX + this.gameState.ball.width / 2 >= this.gameState.Ailine.x)
			{
				this.hitAiLine = true;
				context.fillStyle = "rgba(0, 83, 0, 0.7)";
				context.fillRect((predictionX + this.gameState.ball.width / 2) - 5, (predictionY + this.gameState.ball.height / 2) - 10, 10, 10);
				this.directionY = (predictionY + this.gameState.ball.height / 2);
			}
		}
		context.stroke(); // Dessiner le chemin
	}

	movePaddleAi() {
		this.hitAiLine = false;
		const rand = Math.random(10);
		console.log(rand);
		if (this.directionY < this.gameState.player2.y + this.gameState.player2.height * rand) {
			// Si la balle est au-dessus du centre du paddle
			this.gameState.player2.y -= 10;
		} else if (this.directionY > this.gameState.player2.y + this.gameState.player2.height * rand) {
			// Si la balle est en dessous du centre du paddle
			this.gameState.player2.y += 10;
		}
	
		// Empêcher le paddle de sortir des limites du canvas
		if (this.gameState.player2.y < 0) this.gameState.player2.y = 0;
		if (this.gameState.player2.y + this.gameState.player2.height > canvas.height)
			this.gameState.player2.y = canvas.height - this.gameState.player2.height;
	}

	setupKeyboardControls() {
		window.addEventListener('keydown', (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = true;
				e.preventDefault();
			}
		});

		window.addEventListener('keyup', (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = false;
				e.preventDefault();
			}
		});
	}

	updatePlayerPositions() {
		const moveSpeed = 10;

		// Player 1 movement (W and S keys)
		if (this.keys.w && this.gameState.player1.y > 0) {
			this.gameState.player1.y -= moveSpeed;
		}
		if (this.keys.s && this.gameState.player1.y < canvas.height - this.gameState.player1.height) {
			this.gameState.player1.y += moveSpeed;
		}

		// // Player 2 movement (Arrow keys)
		// if (this.keys.ArrowUp && this.gameState.player2.y > 0) {
		// 	this.gameState.player2.y -= moveSpeed;
		// }
		// if (this.keys.ArrowDown && this.gameState.player2.y < canvas.height - this.gameState.player2.height) {
		// 	this.gameState.player2.y += moveSpeed;
		// }
	}
	
	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/game/`;

			console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				console.log("WebSocket connection established");
				this.isConnected = true;
				this.sendInfoStarting();
			};

			this.socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.handleMessage(data);
				} catch (e) {
					console.error("Failed to parse message:", e);
				}
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			this.socket.onclose = (event) => {
				console.log("WebSocket connection closed:", event.code, event.reason);
				this.isConnected = false;
				this.stopGameLoop();
			};

		} catch (error) {
			console.error("WebSocket connection error:", error);
		}
	}

	startGameLoop() {
		if (this.gameLoopInterval) return;

		this.gameLoopInterval = setInterval(() => {
			// Update player positions based on key states
			this.updatePlayerPositions();
			if (this.hitAiLine)
				this.movePaddleAi();

			// Draw every frame (60 FPS)
			this.ballBounce();

			this.frameCount++;
			if (this.frameCount >= (60 / this.sendRate)) {
				this.frameCount = 0;
			}
		}, 1000 / 60);  // Still run at 60 FPS locally
	}

	stopGameLoop() {
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
	}

	sendInfoStarting()
	{
		const data = {
			type: "game.starting",
			timestamp: Date.now(),
			start: {
				"windowHeight": window.innerHeight * 0.8,
				"windowWidth": window.innerWidth,
				"typeOfMatch": this.typeOfMatch,
			}
		};
	
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	sendBallState() {
		if (!this.isConnected) return;

		const updates = {
			type: "game.ballBounce",
			timestamp: Date.now(),
			start: {
				"ball": {
					"x": this.gameState.ball.x,
					"y": this.gameState.ball.y,
					"gravity": this.gameState.ball.gravity,
					"speed": this.gameState.ball.speed,
				},
			}
		};

		this.sendMessage(updates);
	}

	sendMessage(data) {
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	handleMessage(data) {
		switch (data.type) {
			case "game.starting":
				this.getInfoFromBackend(data);
				this.startGameLoop();
				break;
			case "game.ballBounce":
				this.updateBall(data);
				break;
			case "error":
				console.log(data.type);
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	updateBall(data) {
		this.gameState.ball.y = data.ball.y;
		this.gameState.ball.x = data.ball.x;
		this.gameState.ball.gravity = data.ball.gravity;
	}

	getInfoFromBackend(data)
	{
		this.gameState = {
			Ailine: {
				x: data.player2.x,
				y: 0,
				width: data.player1.width / 2,
				height: canvas.height,
				color: "rgba(204, 7, 0, 0.7)",
				gravity: data.player1.gravity,
			},
			player1: {
				x: data.player1.x,
				y: data.player1.y,
				width: data.player1.width,
				height: data.player1.height,
				color: data.player1.color,
				gravity: data.player1.gravity,
			},
			player2: {
				x: data.player2.x,
				y: data.player2.y,
				width: data.player2.width,
				height: data.player2.height,
				color: data.player2.color,
				gravity: data.player2.gravity,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				gravity: data.ball.gravity,
				speed: data.ball.speed,
			},
			scores: {
				playerOne: data.scores.playerOne,
				playerTwo: data.scores.playerTwo,
				scoreMax: data.scores.scoreMax,
			}
		};
	}

	ballBounce(){
		if(this.gameState.ball.y + this.gameState.ball.gravity <= 0 || this.gameState.ball.y + this.gameState.ball.width + this.gameState.ball.gravity >= canvas.height){
			this.sendBallState();
		} else {
			this.gameState.ball.y += this.gameState.ball.gravity;
			this.gameState.ball.x += this.gameState.ball.speed;
		}
		this.ballWallCollision();
	}

	//make ball bounce against paddle1 or paddle2
	//adding one to the score if not bouncing
	ballWallCollision(){
		if (this.gameState.ball.y + this.gameState.ball.gravity <= this.gameState.player2.y + this.gameState.player2.height
			&& this.gameState.ball.x + this.gameState.ball.width + this.gameState.ball.speed >= this.gameState.player2.x
			&& this.gameState.ball.y + this.gameState.ball.gravity > this.gameState.player2.y) 
		{
			const paddleCenter = this.gameState.player2.y + this.gameState.player2.height / 2;
				const ballCenter = this.gameState.ball.y + this.gameState.ball.height / 2;
				const relativeIntersectY = (paddleCenter - ballCenter) / (this.gameState.player2.height / 2);

				// calculate bounce angle depending on the position of the ball on the paddle
				const bounceAngle = relativeIntersectY * 0.75;

				const speed = Math.sqrt(this.gameState.ball.speed * this.gameState.ball.speed + this.gameState.ball.gravity * this.gameState.ball.gravity);
				this.gameState.ball.speed = -speed * Math.cos(bounceAngle);
				this.gameState.ball.gravity = speed * Math.sin(bounceAngle);

				this.gameState.ball.x = this.gameState.player2.x - this.gameState.ball.width;
		}
		else if (this.gameState.ball.y + this.gameState.ball.gravity >= this.gameState.player1.y &&
				this.gameState.ball.y + this.gameState.ball.gravity <= this.gameState.player1.y + this.gameState.player1.height &&
				this.gameState.ball.x + this.gameState.ball.speed <= this.gameState.player1.x + this.gameState.player1.width)
		{
				const paddleCenter = this.gameState.player1.y + this.gameState.player1.height / 2;
				const ballCenter = this.gameState.ball.y + this.gameState.ball.height / 2;
				const relativeIntersectY = (paddleCenter - ballCenter) / (this.gameState.player1.height / 2);

				// calculate bounce angle depending on the position of the ball on the paddle
				const bounceAngle = relativeIntersectY * 0.75;

				const speed = Math.sqrt(this.gameState.ball.speed * this.gameState.ball.speed + this.gameState.ball.gravity * this.gameState.ball.gravity);
				this.gameState.ball.speed = speed * Math.cos(bounceAngle); // put off the -speed
				this.gameState.ball.gravity = speed * Math.sin(bounceAngle);

				this.gameState.ball.x = this.gameState.player1.x + this.gameState.ball.width;

		} else if (this.gameState.ball.x + this.gameState.ball.speed < this.gameState.player1.x)
		{
			this.gameState.scores.playerTwo++;
			this.checkScore();
			this.resetBall();
		} else if (this.gameState.ball.x + this.gameState.ball.speed > this.gameState.player2.x + this.gameState.player2.width)
		{
			this.gameState.scores.playerOne++;
			this.checkScore();
			this.resetBall();
		}
		if (theme == "base")
			this.drawGame();
	}

	checkScore() {
		if (this.gameState.scores.playerOne == 10 || this.gameState.scores.playerTwo == 10)
		{
			if (this.gameState.scores.playerOne == 10)
			{
				stopGameAi();
				const end = new EndNormalGamePage("PlayerOne");
				end.handle();
			}
			else
			{
				stopGameAi();
				const end = new EndNormalGamePage("PlayerTwo");
				end.handle();
			}
		}
	}

	resetBall() {
		this.gameState.ball.x = canvas.width / 2;
		this.gameState.ball.y = canvas.height / 2;
		this.gameState.ball.speed = Math.abs(this.gameState.ball.speed) * (Math.random() > 0.5 ? 1 : -1); // Changer la direction aléatoirement
		this.gameState.ball.gravity = Math.abs(this.gameState.ball.gravity) * (Math.random() > 0.5 ? 1 : -1);
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.drawPredictedPath();
		firstPaddle(context, this.gameState.player1);
		secondPaddle(context, this.gameState.player2);
		firstPaddle(context,  this.gameState.Ailine);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
	}

	cleanup() {
		// window.removeEventListener('keydown');
		// window.removeEventListener('keyup');
	}
}

let gameSocket = null;

export function aiMode(themeReceived) {
	if (!gameSocket) {
		theme = themeReceived;
		gameSocket = new GameAISocket();
	}
}

export function stopGameAi() {
	if (gameSocket) {
		gameSocket.cleanup();  // Clean up event listeners
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
