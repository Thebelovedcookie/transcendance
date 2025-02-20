import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { EndGamePage } from '../../tournament/EndGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayPlayerName, drawWalls } from './style.js';
let canvas = null;
let context = null;

class GameWebSocket {
	constructor(typeOfMatch, socketTournament, infoMatch) {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		/* for tournament */
		this.typeOfMatch = typeOfMatch; // "normal" || "tournament"
		this.socketTournament = socketTournament; // null for normal || socket of tournament
		this.infoMatch = infoMatch; // null for normal || contains name of player for tournament
		/* end */

		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.keys = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false
		};
		this.setupKeyboardControls();
		console.log("after setup")
		this.connect();
		console.log("after connect")
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
		const moveSpeed = 10;

		// Player 1 movement (W and S keys)
		if (this.keys.w && this.gameState.p1.y > 0) {
			// this.gameState.p1.y -= moveSpeed;
			this.sendMove("up", "p1")
		}
		if (this.keys.s && this.gameState.p1.y < canvas.height - this.gameState.p1.height) {
			// this.gameState.p1.y += moveSpeed;
			this.sendMove("down", "p1")
		}

		// P 2 movement (Arrow keys)
		if (this.keys.ArrowUp && this.gameState.p2.y > 0) {
			// this.gameState.p2.y -= moveSpeed;
			this.sendMove("up", "p2")
		}
		if (this.keys.ArrowDown && this.gameState.p2.y < canvas.height - this.gameState.p2.height) {
			// this.gameState.p2.y += moveSpeed;
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

			// Draw every frame (60 FPS)
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
		console.log("loading data")
		const data = {
			type: "game.starting",
			timestamp: Date.now(),
			start: {
				"windowHeight": canvas.height,
				"windowWidth": canvas.width,
				"typeOfMatch": this.typeOfMatch,
			}
		};

		console.log("data loaded")
		if (this.isConnected && this.socket) {
			console.log("sending data")
			this.socket.send(JSON.stringify(data));
		} else {
			console.log("warning")
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
		console.log(data.type)
		switch (data.type) {
			case "game.state":
				this.getInfoFromBackend(data);
				this.startGameLoop();
				break;
			case "game.result":
				console.log(data.type);
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
		const end = new EndNormalGamePage(data.message.winner, data.message.loser);
		end.handle();
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
		firstPaddle(context, this.gameState.p1);
		// console.log(this.gameState.opponent);
		firstPaddle(context, this.gameState.p2);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		drawWalls(context, canvas);

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

export function normalMode(typeOfMatch, socketTournament, infoMatch) {
	console.log('function normal mode')
	if (!gameSocket) {
		console.log('get new socket')
		gameSocket = new GameWebSocket(typeOfMatch, socketTournament, infoMatch);
	}
	if (gameSocket)
		console.log('have socket')
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
