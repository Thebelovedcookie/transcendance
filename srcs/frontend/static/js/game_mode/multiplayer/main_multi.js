import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { multiPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayScoreThree, displayPlayerName, drawWalls } from './style_multi.js';
let canvas = null;
let context = null;
let theme = "base";

class GameWebSocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height;
		context.clearRect(0, 0, canvas.width, canvas.height);

		//arena
		this.centerX = canvas.width / 2;
		this.centerY = canvas.height / 2;
		this.radius = canvas.height / 2;

		this.lastTouch = "none";

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
		const angleSpeed = 0.05;  // Vitesse de rotation en radians

		function clampAngle(value, min, max) {
			return Math.max(min, Math.min(max, value));
		}

		// Player 1 (Flèches)
		if (this.keys.ArrowRight) {
			this.gameState.player1.startAngle = clampAngle(
				this.gameState.player1.startAngle - angleSpeed,
				0,
				(2 * (Math.PI / 3)) - (Math.PI / 6)
			);
			this.gameState.player1.endAngle = clampAngle(
				this.gameState.player1.endAngle - angleSpeed,
				Math.PI / 6,
				2 * Math.PI / 3
			);
		}
		if (this.keys.ArrowLeft) {
			this.gameState.player1.startAngle = clampAngle(
				this.gameState.player1.startAngle + angleSpeed,
				0,
				(2 * (Math.PI / 3)) - (Math.PI / 6)
			);
			this.gameState.player1.endAngle = clampAngle(
				this.gameState.player1.endAngle + angleSpeed,
				Math.PI / 6,
				2 * Math.PI / 3
			);
		}

		// Player 2 (W et S)
		if (this.keys.s) {
			this.gameState.player2.startAngle = clampAngle(
				this.gameState.player2.startAngle - angleSpeed,
				2 * Math.PI / 3,
				4 * Math.PI / 3 - Math.PI / 6
			);
			this.gameState.player2.endAngle = clampAngle(
				this.gameState.player2.endAngle - angleSpeed,
				2 * Math.PI / 3 + Math.PI / 6,
				4 * Math.PI / 3
			);
		}
		if (this.keys.w) {
			this.gameState.player2.startAngle = clampAngle(
				this.gameState.player2.startAngle + angleSpeed,
				2 * Math.PI / 3,
				4 * Math.PI / 3 - Math.PI / 6
			);
			this.gameState.player2.endAngle = clampAngle(
				this.gameState.player2.endAngle + angleSpeed,
				2 * Math.PI / 3 + Math.PI / 6,
				4 * Math.PI / 3
			);
		}

		// Player 3 (B et N)
		if (this.keys.b) {
			this.gameState.player3.startAngle = clampAngle(
				this.gameState.player3.startAngle - angleSpeed,
				4 * Math.PI / 3,
				2 * Math.PI - Math.PI / 6
			);
			this.gameState.player3.endAngle = clampAngle(
				this.gameState.player3.endAngle - angleSpeed,
				4 * Math.PI / 3 + Math.PI / 6,
				2 * Math.PI
			);
		}
		if (this.keys.n) {
			this.gameState.player3.startAngle = clampAngle(
				this.gameState.player3.startAngle + angleSpeed,
				4 * Math.PI / 3,
				2 * Math.PI - Math.PI / 6
			);
			this.gameState.player3.endAngle = clampAngle(
				this.gameState.player3.endAngle + angleSpeed,
				4 * Math.PI / 3 + Math.PI / 6,
				2 * Math.PI
			);
		}
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

			// Draw every frame (60 FPS)
			this.bounceBall();

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
				"radius": canvas.height / 2,
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

	getInfoFromBackend(data)
	{
		this.gameState = {
			player1: {
				color: data.player1.color,
				centerX: data.player1.centerX,
				centerY: data.player1.centerY,
				radius: data.player1.radius,
				startAngle: data.player1.startAngle,
				endAngle:data.player1.endAngle,
				startZone: data.player1.startZone,
				endZone: data.player1.endZone,
				width: data.player1.width,
			},
			player2: {
				color: data.player2.color,
				centerX: data.player2.centerX,
				centerY: data.player2.centerY,
				radius: data.player2.radius,
				startAngle: data.player2.startAngle,
				endAngle:data.player2.endAngle,
				startZone: data.player2.startZone,
				endZone: data.player2.endZone,
				width: data.player2.width,
			},
			player3: {
				color: data.player3.color,
				centerX: data.player3.centerX,
				centerY: data.player3.centerY,
				radius: data.player3.radius,
				startAngle: data.player3.startAngle,
				endAngle:data.player3.endAngle,
				startZone: data.player3.startZone,
				endZone: data.player3.endZone,
				width: data.player3.width,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				vx: data.ball.speed,
				vy: data.ball.gravity,
			},
			scores: {
				playerOne: data.scores.playerOne,
				playerTwo: data.scores.playerTwo,
				playerThree: data.scores.playerThree,
				scoreMax: data.scores.scoreMax,
			}
		};
	}

	getBallDistanceFromCenter() {
		return Math.sqrt(
			Math.pow(this.gameState.ball.x - this.centerX, 2) + Math.pow(this.gameState.ball.y - this.centerY, 2)
		);
	}

	getBallNextDistanceFromCenter() {
		return Math.sqrt(
			Math.pow((this.gameState.ball.x + this.gameState.ball.vx) - this.centerX, 2)
			+ Math.pow((this.gameState.ball.y + this.gameState.ball.vy) - this.centerY, 2)
		);
	}

	updateBall() {
		this.gameState.ball.x += this.gameState.ball.vx;
		this.gameState.ball.y += this.gameState.ball.vy;
	}

	bounceBall() {

		const angleBall = this.getAngleOfBall() + Math.PI;
		const width = 2 * this.gameState.player1.width;

		const fudge = 2. * this.gameState.ball.width * ((1 +  Math.cos(2 * angleBall - Math.PI  / 2) / 2))
		console.log(fudge);
		const angleFudge = Math.PI* 0.01;
		if (this.gameState.ball.y < this.gameState.width  / 2)
			width = width * fudge;

		const distanceBall = this.getBallDistanceFromCenter();

		if (distanceBall >= this.radius - width && distanceBall <= this.radius
			&& (angleBall >= this.gameState.player1.startAngle - angleFudge && angleBall <= this.gameState.player1.endAngle + angleFudge)
				&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player1.endAngle - this.gameState.player1.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player1.endAngle - this.gameState.player1.startAngle) / 2);

			const bounceAngle = relativeIntersectY * (Math.PI / 3);
			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));
			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player1";
		}
		else if ((distanceBall >= this.radius - width && distanceBall <= this.radius
			&& angleBall >= this.gameState.player2.startAngle - angleFudge && angleBall <= this.gameState.player2.endAngle + angleFudge)
			&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player2.endAngle - this.gameState.player2.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player2.endAngle - this.gameState.player2.startAngle) / 2);

			const bounceAngle = (relativeIntersectY * (Math.PI / 3));

			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));

			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player2";
		}
		else if ((distanceBall >= this.radius - width && distanceBall <= this.radius
			&& angleBall >= this.gameState.player3.startAngle - angleFudge && angleBall <= this.gameState.player3.endAngle + angleFudge)
			&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player3.endAngle - this.gameState.player3.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player3.endAngle - this.gameState.player3.startAngle) / 2);

			const bounceAngle = relativeIntersectY * (Math.PI / 3);
			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));
			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player3";
		}
		else if (distanceBall >= this.radius * 1.4)
		{
			this.manageScore();
		}
		this.updateBall();
		this.drawGame();
	}

	manageScore()
	{
		const angleBall = this.getAngleOfBall() + Math.PI;

		if (this.lastTouch == "player1" && angleBall > this.gameState.player1.endZone)
			this.gameState.scores.playerOne++;
		else if ((this.lastTouch == "player1" || this.lastTouch == 'none')&& angleBall < this.gameState.player1.endZone) {
			this.gameState.scores.playerTwo++;
			this.gameState.scores.playerThree++;
		}
		else if (this.lastTouch == "player2" && (angleBall < this.gameState.player2.startZone || angleBall > this.gameState.player2.endZone))
			this.gameState.scores.playerTwo++;
		else if ((this.lastTouch == "player2" || this.lastTouch == 'none') && (angleBall > this.gameState.player2.startZone || angleBall < this.gameState.player2.endZone)) {
			this.gameState.scores.playerOne++;
			this.gameState.scores.playerThree++;
		}
		else if (this.lastTouch == "player3" && angleBall < this.gameState.player3.startZone)
			this.gameState.scores.playerThree++;
		else if ((this.lastTouch == "player3" || this.lastTouch == 'none') && angleBall > this.gameState.player3.startZone) {
			this.gameState.scores.playerOne++;
			this.gameState.scores.playerTwo++;
		}
		this.checkScore();
		this.resetBall();
	}

	getAngleOfBall()
	{
		return (Math.atan2(this.centerY - this.gameState.ball.y, this.centerX - this.gameState.ball.x));
	}

	checkScore() {
		if (this.gameState.scores.playerOne == 10
			|| this.gameState.scores.playerTwo == 10 || this.gameState.scores.playerThree == 10)
		{
			if (this.gameState.scores.playerOne == 10)
			{
				stopGame();
				const end = new EndNormalGamePage("Player 1", "Player 2 and Player 3");
				end.handle();
			}
			else if (this.gameState.scores.playerTwo == 10)
			{
				stopGame();
				const end = new EndNormalGamePage("Player 2", "Player 1 and Player 3");
				end.handle();
			}
			else
			{
				stopGame();
				const end = new EndNormalGamePage("Player 3", "Player 1 and Player 2");
				end.handle();
			}
		}
	}

	resetBall() {
		this.gameState.ball.x = this.centerX;
		this.gameState.ball.y = this.centerY;

		if (!this.gameState.ball.speed) this.gameState.ball.speed = 4;

		const angle = Math.random() * 2 * Math.PI

		this.gameState.ball.vx = this.gameState.ball.speed * Math.cos(angle);
		this.gameState.ball.vy = this.gameState.ball.speed * Math.sin(angle);
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawDashedLine(context, canvas);
		drawWalls(context, canvas)
		multiPaddle(context, this.gameState.player1);
		multiPaddle(context, this.gameState.player2);
		multiPaddle(context, this.gameState.player3);
		ballStyle(context, this.gameState.ball);

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;
		const scoreThree = this.gameState.scores.playerThree ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
		displayScoreThree(context, scoreThree, canvas);

		displayPlayerName(context, canvas);
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
