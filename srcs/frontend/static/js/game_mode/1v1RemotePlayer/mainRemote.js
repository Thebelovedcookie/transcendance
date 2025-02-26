import { WinnerRemoteGamePage } from '../../pages/WinnerRemoteGamePage.js';
import { LoserRemoteGamePage } from '../../pages/LoserRemoteGamePage.js';
import { ForfaitRemoteGamePage } from '../../pages/ForfaitRemoteGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, drawWalls} from './style.js';
let canvas = null;
let context = null;

class RemoteGameWebSocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		this.container = document.querySelector('.game-container');
		this.loadingText = this.container.querySelector('.typewriter-text');
		this.backButton = this.container.querySelector('.back-button');
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		this.paddle_side = null;
		this.ctrlUp;
		this.ctrlDown;
		this.matchId = null;
		this.playerId = null;
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gameState;
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
		if (this.keys[this.ctrlUp] && this.gameState.me.y > 0) {
			this.sendMove("up");
		}
		if (this.keys[this.ctrlDown] && this.gameState.me.y < canvas.height - this.gameState.me.height) {
			this.sendMove("down");
		}
	}
 
	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/pong/`;

			console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				console.log("WebSocket connection established");
				this.isConnected = true;
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

		this.loadingText.remove();
		this.backButton.remove();

		this.gameLoopInterval = setInterval(() => {
			this.updatePlayerPositions();

			this.drawGame();

			this.frameCount++;
			if (this.frameCount >= (60 / this.sendRate)) {
				this.frameCount = 0;
			}
		}, 1000 / 60);
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
			matchId: this.matchId,
			playerId: this.playerId,
			canvas: {
				"canvasHeight": canvas.height,
				"canvasWidth": canvas.width,
			}
		};

		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	sendMove(direction) {
		if (!this.isConnected) return;

		const updates = {
			type: "player.moved",
			timestamp: Date.now(),
			'matchId': this.matchId,
			'playerId': this.playerId,
			'direction': direction,
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
			case "playerId":
				this.playerId = data.playerId;
				break;
			case "reconnection":
				console.log(data);
				this.getBackInTheGame(data);
				this.startGameLoop();
				break;
			case "game.init":
				this.isItForMe(data);
				break;
			case "game_state":
				this.updateGame(data);
				this.startGameLoop();
				break;
			case "game_result":
				this.getResult(data);
				break;
			case "forfait":
				this.winByForfait(data);
				break;
			case "error":
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	getBackInTheGame(data) {
		this.matchId = data.matchId;
		this.paddle_side = data.side;
		this.ctrlDown = data.ctrlDown;
		this.ctrlUp = data.ctrlUp;
		this.playerId = data.id;
		this.keys = {
			[this.ctrlUp]: false,
			[this.ctrlDown]: false
		}
		this.setupKeyboardControls();

		this.gameState = {
			me: {
				x: data.me.x,
				y: data.me.y,
				width: data.me.width,
				height: data.me.height,
				color: data.me.color,
				gravity: data.me.gravity,
				score: data.me.score
			},
			opponent: {
				x: data.opponent.x,
				y: data.opponent.y,
				width: data.opponent.width,
				height: data.opponent.height,
				color: data.opponent.color,
				gravity: data.opponent.gravity,
				score: data.opponent.score
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				size: data.ball.size,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				speed: data.ball.speed,
				gravity: data.ball.gravity,
				vx: data.ball.vx,
				vy: data.ball.vy
			},
			score: {
				scoreMax: data.message.scores.scoreMax
			}
		}
	}

	getResult(data) {
		if (data.message.matchId != this.matchId)
			return;
		if (data.message.winner.id == this.playerId)
		{
			stopGame();
			const victory = new WinnerRemoteGamePage();
			victory.handle();
		}
		else if (data.message.loser.id == this. playerId)
		{
			stopGame();
			const defeat = new LoserRemoteGamePage();
			defeat.handle();
		}
	}

	winByForfait(data) {
		if (data.message.matchId != this.matchId)
			return ;
		stopGame();
		const end = new ForfaitRemoteGamePage();
		end.handle();
	}

	updateGame(data) {
		if (data.message.matchId != this.matchId)
			return;
		this.gameState = {
			me: {
				x: data.message.playerOne.x,
				y: data.message.playerOne.y,
				width: data.message.playerOne.width,
				height: data.message.playerOne.height,
				color: data.message.playerOne.color,
				gravity: data.message.playerOne.gravity,
				score: data.message.playerOne.score
			},
			opponent: {
				x: data.message.playerTwo.x,
				y: data.message.playerTwo.y,
				width: data.message.playerTwo.width,
				height: data.message.playerTwo.height,
				color: data.message.playerTwo.color,
				gravity: data.message.playerTwo.gravity,
				score: data.message.playerTwo.score
			},
			ball: {
				x: data.message.ball.x,
				y: data.message.ball.y,
				size: data.message.ball.size,
				width: data.message.ball.width,
				height: data.message.ball.height,
				color: data.message.ball.color,
				speed: data.message.ball.speed,
				gravity: data.message.ball.gravity,
				vx: data.message.ball.vx,
				vy: data.message.ball.vy
			},
			score: {
				scoreMax: data.message.scores.scoreMax
			}
		}
	}

	//checking if the message is for us or not since its send to every client
	isItForMe(data) {
		if (data.message.playerOne.id === this.playerId)
		{
			this.matchId = data.message.matchId;
			this.paddle_side = data.message.playerOne.side;
			this.ctrlUp = data.message.playerOne.ctrlUp;
			this.ctrlDown = data.message.playerOne.ctrlDown;
			this.keys = {
				[this.ctrlUp]: false,
				[this.ctrlDown]: false
			}
			this.setupKeyboardControls();
			this.sendInfoStarting();
		}
		else if (data.message.playerTwo.id === this.playerId)
		{
			this.matchId = data.message.matchId;
			this.paddle_side = data.message.playerTwo.side;
			this.ctrlUp = data.message.playerTwo.ctrlUp;
			this.ctrlDown = data.message.playerTwo.ctrlDown;
			this.keys = {
				[this.ctrlUp]: false,
				[this.ctrlDown]: false
			}
			this.setupKeyboardControls();
			this.sendInfoStarting();
		}
		else
			return;
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		firstPaddle(context, this.gameState.me);
		firstPaddle(context, this.gameState.opponent);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		drawWalls(context, canvas);

		const scoreOne = this.gameState.me.score ?? 0;
		const scoreTwo = this.gameState.opponent.score ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function normalMode() {
	const authState = window.router.getAuthState();
	const isLoggedIn = authState.isAuthenticated;
	if (!isLoggedIn) {
		window.router.navigate('/login');
	}
	if (!gameSocket) {
		gameSocket = new RemoteGameWebSocket();
	}
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup();
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
