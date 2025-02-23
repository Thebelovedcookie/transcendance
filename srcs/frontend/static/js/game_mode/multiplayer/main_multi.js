import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { multiPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayScoreThree, displayPlayerName, drawWalls } from './style_multi.js';
let canvas = null;
let context = null;

class GameWebSocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height;
		context.clearRect(0, 0, canvas.width, canvas.height);

		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.keys = {
			w: false,
			s: false,
			b: false,
			n: false,
			ArrowRight: false,
			ArrowLeft: false
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
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
		// Player 1 (Flèches)
		if (this.keys.ArrowRight) {
			this.sendMove("neg", "p1")
		}
		if (this.keys.ArrowLeft) {
			this.sendMove("pos", "p1")
		}

		// Player 2 (W et S)
		if (this.keys.s) {
			this.sendMove("neg", "p2")
		}
		if (this.keys.w) {
			this.sendMove("pos", "p2")
		}

		// Player 3 (B et N)
		if (this.keys.b) {
			this.sendMove("neg", "p3")
		}
		if (this.keys.n) {
			this.sendMove("pos", "p3")
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
			const wsUrl = `${protocol}//${host}/ws/multi/`;

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
			if (this.frameCount >= (60 / this.sendRate)) {
				this.frameCount = 0;
			}
		}, 1000 / 60);  // Still run at 60 FPS locally
	}

	drawPause() {

		const rectWidth = 50;
		const rectHeight = 200;
		
		context.fillStyle = "black";
		context.fillRect(canvas.width / 2 - 70, canvas.height / 2 - 100, rectWidth, rectHeight);
	
		context.fillRect(canvas.width / 2 + 20, canvas.height / 2 - 100, rectWidth, rectHeight);
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
				"windowHeight": canvas.height,
				"windowWidth": canvas.width,
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
				this.getInfoFromBackend(data);
				this.startGameLoop();
				break;
			case "game.result":
				this.getResult(data);
				break;
			case "error":
				console.log(data.type);
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	getResult(data) {
		stopGame();
		const end = new EndNormalGamePage(data.winner, data.loser);
		end.handle();
	}

	getInfoFromBackend(data)
	{
		this.gameState = {
			canvas: {
				dim: data.canvas.dim,
				centerX: data.canvas.centerX,
				centerY: data.canvas.centerY,
				radius: data.canvas.radius,
				size: data.canvas.size,
			},
			player1: {
				name: data.playerOne.name,
				color: data.playerOne.color,
				startAngle: data.playerOne.startAngle,
				endAngle:data.playerOne.endAngle,
				deltaAngle: data.playerOne.deltaAngle,
				startZone: data.playerOne.startZone,
				endZone: data.playerOne.endZone,
				width: data.playerOne.width,
				score: data.playerOne.score,
			},
			player2: {
				name: data.playerTwo.name,
				color: data.playerTwo.color,
				startAngle: data.playerTwo.startAngle,
				endAngle:data.playerTwo.endAngle,
				deltaAngle: data.playerTwo.deltaAngle,
				startZone: data.playerTwo.startZone,
				endZone: data.playerTwo.endZone,
				width: data.playerTwo.width,
				score: data.playerTwo.score,
			},
			player3: {
				name: data.playerThree.name,
				color: data.playerThree.color,
				startAngle: data.playerThree.startAngle,
				endAngle:data.playerThree.endAngle,
				deltaAngle: data.playerThree.deltaAngle,
				startZone: data.playerThree.startZone,
				endZone: data.playerThree.endZone,
				width: data.playerThree.width,
				score: data.playerThree.score,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				size: data.ball.size,
				color: data.ball.color,
				speed: data.ball.speed,
				vx: data.ball.vx,
				vy: data.ball.vy,
			}
		};
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawDashedLine(context,  this.gameState.canvas);
		drawWalls(context, this.gameState.canvas)
		multiPaddle(context, this.gameState.player1, this.gameState.canvas);
		multiPaddle(context, this.gameState.player2, this.gameState.canvas);
		multiPaddle(context, this.gameState.player3, this.gameState.canvas);
		ballStyle(context, this.gameState.ball);

		const scoreOne = this.gameState.player1.score ?? 0;
		const scoreTwo = this.gameState.player2.score ?? 0;
		const scoreThree = this.gameState.player3.score ?? 0;

		displayScoreOne(context, scoreOne,  this.gameState.canvas);
		displayScoreTwo(context, scoreTwo,  this.gameState.canvas);
		displayScoreThree(context, scoreThree,  this.gameState.canvas);

		displayPlayerName(context,  this.gameState.canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function multiMode() {
	if (!gameSocket) {
		gameSocket = new GameWebSocket();
	}
	if (gameSocket)
		return gameSocket;
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup();
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
