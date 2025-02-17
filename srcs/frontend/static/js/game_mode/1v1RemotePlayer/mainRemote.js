import { WinnerRemoteGamePage } from '../../pages/WinnerRemoteGamePage.js';
import { LoserRemoteGamePage } from '../../pages/LoserRemoteGamePage.js';
import { ForfaitRemoteGamePage } from '../../pages/ForfaitRemoteGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, drawWalls} from './style.js';
let canvas = null;
let context = null;
let theme = "base";

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
		this.ballrequestgone = false;
		this.playerId = null;
		this.opponentId = null;
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

			//creer un id aleatoire
			console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl); //envoie l'id dans l'url

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
		console.log(data.type);
		switch (data.type) {
			case "playerId":
				this.playerId = data.playerId;
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
				console.log(data);
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	getResult(data) {
		if (data.message.matchId != this.matchId)
			return;
		if (data.message.winner.id == this.playerId)
		{
			const victory = new WinnerRemoteGamePage();
			victory.handle();
			this.stopGameLoop();
		}
		else if (data.message.loser.id == this. playerId)
		{
			const defeat = new LoserRemoteGamePage();
			defeat.handle();
			this.stopGameLoop();
		}
	}

	winByForfait(data) {
		if (data.message.matchId != this.matchId)
			return ;
		const end = new ForfaitRemoteGamePage();
		end.handle();
		this.stopGameLoop();
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
				width: data.message.ball.width,
				height: data.message.ball.height,
				color: data.message.ball.color,
				speed: data.message.ball.speed,
				gravity: data.message.ball.gravity
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
			this.opponentId = data.message.playerTwo.id;
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
			this.opponentId = data.message.playerOne.id;
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
		gameSocket.cleanup(); // this function is not working properly
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
