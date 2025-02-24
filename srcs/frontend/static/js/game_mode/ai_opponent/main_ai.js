import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, drawWalls } from './style_ai.js';
let canvas = null;
let context = null;
let theme = "base";

class GameAISocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		this.pause = false;
		this.hitAiLine = false;
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.directionY = 0;
		this.positionP1 = 0;
		this.keys = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false,
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
	}

	predictedPath() {
		let predictionX = this.gameState.ball.x;
		let predictionY = this.gameState.ball.y;
		let predictionSpeedX = this.gameState.ball.speed;
		let predictionSpeedY = this.gameState.ball.gravity;

		for (let i = 0; i < 60; i++) {
			predictionX += predictionSpeedX;
			predictionY += predictionSpeedY;

			if (predictionX + this.gameState.ball.width > canvas.width || predictionX < 0) {
				predictionSpeedX *= -1;
			}
			if (predictionY + this.gameState.ball.height > canvas.height || predictionY < 0) {
				predictionSpeedY *= -1;
				predictionY = predictionY + this.gameState.ball.height > canvas.height ? canvas.height - this.gameState.ball.height : predictionY;
			}

			this.directionY = (predictionY + this.gameState.ball.height / 2);
		}

		this.positionP1 = this.gameState.p1.y;
	}

	movePaddleAi() {
		if (this.directionY == 0)
			return;
		if (this.directionY < this.gameState.p2.y + this.gameState.p2.height) {
			const keyEvent = new KeyboardEvent('keydown', {
				key : 'ArrowUp',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent);

		} else if (this.directionY > this.gameState.p2.y + this.gameState.p2.height) {
			const keyEvent = new KeyboardEvent('keydown', {
				key : 'ArrowDown',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent);
		}
	}

	stopMovePaddleAi()
	{
		if (this.directionY == 0)
			return;
		//prend la decision d'envoyer la balle a l'oppose du joueur en face
		if (this.positionP1 != 0 && this.keys.ArrowUp
			&& this.positionP1 > this.directionY
				&& this.directionY > this.gameState.p2.y
					&& this.directionY <= this.gameState.p2.y + 15)
		{
			const keyEvent = new KeyboardEvent('keyup', {
				key : 'ArrowUp',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent);
		}
		else if (this.keys.ArrowUp && this.directionY > this.gameState.p2.y
			&& this.directionY < this.gameState.p2.y + this.gameState.p2.height)
		{
			const keyEvent = new KeyboardEvent('keyup', {
				key : 'ArrowUp',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent);
		}
		//prend la decision d'envoyer la balle a l'oppose du joueur en face
		if (this.positionP1 != 0 && this.keys.ArrowDown
			&& this.positionP1 < this.directionY
				&& this.directionY > this.gameState.p2.y
					&& this.directionY + 15 <= this.gameState.p2.y)
		{
			const keyEvent = new KeyboardEvent('keyup', {
				key : 'ArrowUp',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent);
		}
		else if (this.keys.ArrowDown && this.directionY > this.gameState.p2.y
			&& this.directionY < this.gameState.p2.y + this.gameState.p2.height)
		{
			const keyEvent2 = new KeyboardEvent('keyup', {
				key : 'ArrowDown',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(keyEvent2);
		}
	}

	setupKeyboardControls() {
		this.keyDownHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = true;
				e.preventDefault();
			}
		};

		this.keyUpHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = false;
				e.preventDefault();
			}
		};

		window.addEventListener('keydown', this.keyDownHandler);
		window.addEventListener('keyup', this.keyUpHandler);
	}

	updatePlayerPositions() {

		if (this.keys.w && this.gameState.p1.y > 0) {
			this.sendMove("up", "p1")
		}
		if (this.keys.s && this.gameState.p1.y < canvas.height - this.gameState.p1.height) {
			this.sendMove("down", "p1")
		}

		if (this.keys.ArrowUp && this.gameState.p2.y > 0) {
			this.sendMove("up", "p2")
		}
		if (this.keys.ArrowDown && this.gameState.p2.y < canvas.height - this.gameState.p2.height) {
			this.sendMove("down", "p2")
		}
	}

	sendMove(direction, player) {
		if (!this.isConnected) return;

		const updates = {
			type: "player.moved",
			'player': player,
			'direction': direction,
		};
		this.sendMessage(updates);
	}

	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/ai/`;

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

			this.drawGame();

			this.frameCount++;
			if (this.frameCount == 30)
				this.predictedPath();
			this.movePaddleAi();
			this.stopMovePaddleAi();
			if (this.frameCount == 60)
				this.frameCount = 0;
		}, 1000 / 60);
	}

	stopGameLoop() {
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
	}

	sendPause() {
		if (!this.isConnected) return;

		const updates = {
			type: "player.pause",
		};
		this.sendMessage(updates);
	}

	sendUnpause() {
		if (!this.isConnected) return;

		this.pause = false;
		const updates = {
			type: "player.unpause",
		};
		this.sendMessage(updates);
	}

	drawPause() {
		this.pause = true;
		this.sendPause();
		const rectWidth = 50;
		const rectHeight = 200;
		
		context.fillStyle = "black";
		context.fillRect(canvas.width / 2 - 70, canvas.height / 2 - 100, rectWidth, rectHeight);
	
		context.fillRect(canvas.width / 2 + 20, canvas.height / 2 - 100, rectWidth, rectHeight);
	}

	sendInfoStarting()
	{
		const data = {
			type: "game.starting",
			timestamp: Date.now(),
			start: {
				"windowHeight": canvas.height,
				"windowWidth": canvas.width,
				"typeOfMatch": this.typeOfMatch,
			}
		};
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
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
			case "game.state":
				if (this.pause == false)
				{
					this.getInfoFromBackend(data);
					this.startGameLoop();
				}
				break;
			case "match.result":
				this.getResult(data);
				break;
			case "error":
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	getResult(data) {
		if (data.winner == 'p1')
		{
			stopGameAi();
			const victory = new EndNormalGamePage("PlayerOne", "Ai");
			victory.handle();
		}
		else if (data.winner == 'p2')
		{
			stopGameAi();
			const defeat = new EndNormalGamePage("Ai", "PlayerOne");
			defeat.handle();
		}
	}

	getInfoFromBackend(data)
	{
		this.gameState = {
			p1: {
				x: data.playerOne.x,
				y: data.playerOne.y,
				width: data.playerOne.width,
				height: data.playerOne.height,
				color: data.playerOne.color,
				gravity: data.playerOne.gravity,
				score: data.playerOne.score
			},
			p2: {
				x: data.playerTwo.x,
				y: data.playerTwo.y,
				width: data.playerTwo.width,
				height: data.playerTwo.height,
				color: data.playerTwo.color,
				gravity: data.playerTwo.gravity,
				score: data.playerTwo.score
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				speed: data.ball.speed,
				gravity: data.ball.gravity
			},
			score: {
				scoreMax: data.scoreMax
			}
		}
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawWalls(context, canvas);
		firstPaddle(context, this.gameState.p1);
		secondPaddle(context, this.gameState.p2);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		const scoreOne = this.gameState.p1.score ?? 0;
		const scoreTwo = this.gameState.p2.score ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function aiMode(themeReceived) {
	if (!gameSocket) {
		theme = themeReceived;
		gameSocket = new GameAISocket();
	}
	if (gameSocket)
		return (gameSocket);
}

export function stopGameAi() {
	if (gameSocket) {
		gameSocket.cleanup();
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
