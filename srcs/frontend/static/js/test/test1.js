import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo } from './style.js';

class GameWebSocket {
	constructor() {
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gameState = {
			player1: {
				x: 5,
				y: window.innerHeight * 0.4,
				width: window.innerWidth / 80,
				height: window.innerHeight / 6,
				color: "white",
				gravity: 2,
			},
			player2: {
				x: window.innerWidth - 20,
				y: window.innerHeight * 0.4,
				width: window.innerWidth / 80,
				height: window.innerHeight / 6,
				color: "white",
				gravity: 2,
			},
			ball: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				width: 15,
				height: 15,
				color: "white",
				speed: 8,
				gravity: 3,
			},
			scores: {
				playerOne: 0,
				playerTwo: 0,
			}
		};
		this.keys = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
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
		if (this.keys.s && this.gameState.player1.y < window.innerHeight - this.gameState.player1.height) {
			this.gameState.player1.y += moveSpeed;
		}

		// Player 2 movement (Arrow keys)
		if (this.keys.ArrowUp && this.gameState.player2.y > 0) {
			this.gameState.player2.y -= moveSpeed;
		}
		if (this.keys.ArrowDown && this.gameState.player2.y < window.innerHeight - this.gameState.player2.height) {
			this.gameState.player2.y += moveSpeed;
		}
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
				this.startGameLoop();
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
				setTimeout(() => this.connect(), 3000);
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

			// Send state only every N frames
			this.frameCount++;
			if (this.frameCount >= (60 / this.sendRate)) {
				this.sendGameState();
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

	sendGameState() {
		if (!this.isConnected) return;

		const updates = {
			type: "game.update",
			timestamp: Date.now(),
			changes: {}
		};

		if (this.keys.w || this.keys.s) {
			updates.changes.player1 = {
				y: this.gameState.player1.y
			};
		}

		if (this.keys.ArrowUp || this.keys.ArrowDown) {
			updates.changes.player2 = {
				y: this.gameState.player2.y
			};
		}

		if (Object.keys(updates.changes).length > 0) {
			this.sendMessage(updates);
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
			case "game.update":
				this.updateGameState(data);
				break;
			case "error":
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	updateGameState(data) {
		if (data.changes) {
			if (data.changes.player1) {
				this.gameState.player1 = { ...this.gameState.player1, ...data.changes.player1 };
			}
			if (data.changes.player2) {
				this.gameState.player2 = { ...this.gameState.player2, ...data.changes.player2 };
			}
			if (data.changes.ball) {
				this.gameState.ball = { ...this.gameState.ball, ...data.changes.ball };
			}
			if (data.changes.scores) {
				this.gameState.scores = { ...this.gameState.scores, ...data.changes.scores };
			}
		}

		this.drawGame();
	}

	drawGame() {
		const canvas = document.getElementById("pongGame");
		if (!canvas) return;

		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);

		firstPaddle(context, this.gameState.player1);
		secondPaddle(context, this.gameState.player2);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
	}

	cleanup() {
		window.removeEventListener('keydown');
		window.removeEventListener('keyup');
	}
}

let gameSocket = null;

export function startGame() {
	if (!gameSocket) {
		gameSocket = new GameWebSocket();
	}
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup();  // Clean up event listeners
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
