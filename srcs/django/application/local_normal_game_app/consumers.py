from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import random
import time
import json
import logging
import asyncio
import math

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):

	infoMatch = {
		"match": []
	}
	#connection to the WebSocket
	async def connect(self):
		logger.info("WebSocket connection attempt")
		try:
			await self.accept()
			logger.info("WebSocket connection accepted")
		except Exception as e:
			logger.error(f"WebSocket connection failed: {e}")
		await self.createGame()

	#interrupt the Websocket
	async def disconnect(self, close_code):
		logger.info(f"WebSocket disconnected with code: {close_code}")
		if len(self.infoMatch["match"]) != 0:
			m = self.infoMatch["match"][0]
			m["status"] = "False"

	#Manage the info receive
	async def receive(self, text_data):
		try:

			# Decode Json data
			data = json.loads(text_data)

			# search for the type of the message
			message_type = data.get("type")

			# Manage the type of the msg
			if message_type == "game.starting":
				await self.initialisation(data)
				asyncio.create_task(self.loop())
				return
			elif message_type == "player.moved":
				await self.moveChange(data)
				return
			elif message_type == "player.pause":
				m = self.infoMatch['match'][0]
				m["status"] = "pause"
				return
			elif message_type == "player.unpause":
				m = self.infoMatch['match'][0]
				m["status"] = "True"
				asyncio.create_task(self.loop())
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			# Envoyer la réponse au client
			self.send(text_data=json.dumps(response))

		except json.JSONDecodeError:
			logger.error("Error: Invalid JSON received")
			self.send(text_data=json.dumps({
				"type": "error",
				"message": "Invalid JSON format"
			}))

	async def createGame(self):
		obj = {
			'status': "True",
			'playerOne': {
			},
			'playerTwo': {
			}
		}
		self.infoMatch['match'].append(obj)

	async def initialisation(self, data):
		m = self.infoMatch["match"][0]
		start_data = data.get("start", {})
		canvas_height = start_data.get("windowHeight", 0)
		canvas_width = start_data.get("windowWidth", 0)
		typeOfMatch = start_data.get("typeOfMatch", 0)

		canvas_dim = min(canvas_height, canvas_width)
		size = int(canvas_dim  / 45)

		m["maxScore"] = 10
		m["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width, "size": size}
		if typeOfMatch == "tournament":
			m["maxScore"] = 5

		m["playerOne"].update({
			"x": 5,
			"y": canvas_height * 0.4,
			"width": size,
			"height": size * 9,
			"color": "black",
			"score": 0
			})
		m["playerTwo"].update({
			"x": canvas_width - 20,
			"y": canvas_height * 0.4,
			"width": size,
			"height": size * 9,
			"color": "black",
			"score": 0
			})
		m["ball"] = {
			"x": canvas_width / 2,
			"y": canvas_height / 2,
			"size": size,
			"width": size,
			"height": size,
			"color": "black",
			"speed": 8,
			"vx": 0,
			"vy": 0
			}
		self.resetBall(m)

	######################## GAME LOOP #############################

	async def loop(self):
		m = self.infoMatch["match"][0]

		while (m["status"] == "True"):
			await asyncio.sleep(1 / 60)
			await self.calculBallMovement()
			await self.send_gamestate()

		if m["status"] == "False":
			self.infoMatch["match"].remove(m)

	async def send_gamestate(self):
		m = self.infoMatch["match"][0]

		response = {
			"type" : "game.state",
			"playerOne": m["playerOne"],
			"playerTwo": m["playerTwo"],
			"ball": m["ball"],
			"scoreMax": m["maxScore"]
		}
		if m["status"]:
			try:
				await self.send(text_data=json.dumps(response))
			except Exception as e:
				print(f"Erreur lors de l'envoi des données : {e}")
				m["status"] = "False"


	# place ball in center of canvas and give it a random initial velocity
	def resetBall(self, m):
		m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
		m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2
		angle = random.random() * math.pi / 3
		ran = random.random()
		direction = 1
		if ran > 0.5:
			direction = -1
		ran = random.random()
		phase = math.pi
		if ran > 0.5:
			phase = 0
		angle = direction * angle + phase
		m["ball"]["vx"] = m["ball"]["speed"] * math.cos(angle)
		m["ball"]["vy"] = m["ball"]["speed"] * math.sin(angle)

	#check if movement in y-dir result in wall impact
	def at_wall(self):
		m = self.infoMatch["match"][0]
		# top wall
		if m["ball"]["y"] + m["ball"]["vy"] <= 0:
			return True
		# bottom wall
		elif m["ball"]["y"] + m["ball"]["size"] + m["ball"]["vy"] >=  m["canvas"]["canvas_height"]:
			return True
		else:
			return False

	async def calculBallMovement(self):
		m = self.infoMatch["match"][0]

		# if impacting wall, reverse y velocity
		if self.at_wall():
			m["ball"]["vy"] *= -1
		m["ball"]["x"] += m["ball"]["vx"]
		m["ball"]["y"] += m["ball"]["vy"]
		await self.ballPaddleCollision(m)

	# update ball velocities and last touch following strike
	def executeBallStrike(self, m, player):
		factor = -1
		if player["x"] < m["canvas"]["canvas_width"] / 2:
			factor = 1
		paddleCenter = player["y"] + player["height"] / 2
		ballCenter = m["ball"]["y"] + m["ball"]["size"] / 2
		relativeIntersectY = (paddleCenter - ballCenter) / (player["height"] / 2)
		bounceAngle = relativeIntersectY * 0.75
		speed = math.sqrt(m["ball"]["vx"] * m["ball"]["vx"] + m["ball"]["vy"] * m["ball"]["vy"])
		m["ball"]["vx"] = factor * speed * math.cos(bounceAngle)
		m["ball"]["vy"] = speed * math.sin(bounceAngle)
		m["ball"]["x"] = player["x"] + factor * m["ball"]["size"]

	# check if location of ball overlaps location of paddle
	def inPaddle(self, player):
		m = self.infoMatch["match"][0]

		if player["x"] > m["canvas"]["canvas_width"] / 2:
			if (m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
				and m["ball"]["x"] + m["ball"]["size"] + m["ball"]["vx"] >= player["x"]
				and m["ball"]["y"] + m["ball"]["vy"] > player["y"]):
				return True

		if player["x"] < m["canvas"]["canvas_width"] / 2:
			if (m["ball"]["y"] + m["ball"]["vy"] >= player["y"]
				and m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
				and m["ball"]["x"] + m["ball"]["vx"] <= player["x"] + player["width"]):
				return True

		return False

	async def ballPaddleCollision(self, m):
		if self.inPaddle(m["playerTwo"]):
			self.executeBallStrike(m, m["playerTwo"])
		elif self.inPaddle(m["playerOne"]):
			self.executeBallStrike(m, m["playerOne"])
		elif (m["ball"]["x"] + m["ball"]["vx"] < m["playerOne"]["x"]):
			m["playerTwo"]["score"] += 1
			self.resetBall(m)
			await self.checkScore(m)
		elif (m["ball"]["x"] + m["ball"]["vx"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
			m["playerOne"]["score"] += 1
			self.resetBall(m)
			await self.checkScore(m)
	
	async def checkScore(self, m):
		if (m["playerOne"]["score"] == m["maxScore"]):
			m["status"] = "False"
			await self.sendMatchResult(m, "Player 1", "Player 2")
		elif (m["playerTwo"]["score"] == m["maxScore"]):
			m["status"] = "False"
			await self.sendMatchResult(m, "Player 2", "Player 1")

	#################### PLAYER MOVE ##########################

	async def moveChange(self, data):
		m = self.infoMatch["match"][0]
		player = data.get("player", None)
		direction = data.get("direction")

		if player == "p1":
			if (direction == "up" and m["playerOne"]["y"] > 0):
				m["playerOne"]["y"] -= 10
			elif (direction == "down" and m["playerOne"]["y"] < m["canvas"]["canvas_height"] - m["playerOne"]["height"]):
				m["playerOne"]["y"] += 10
		elif player == "p2":
			if (direction == "up" and m["playerTwo"]["y"] > 0):
				m["playerTwo"]["y"] -= 10
			elif (direction == "down" and m["playerTwo"]["y"] < m["canvas"]["canvas_height"] - m["playerOne"]["height"]):
				m["playerTwo"]["y"] += 10

	async def sendMatchResult(self, m, winner, loser):
		response = {
			"type": "game.result",
			"winner": winner,
			"loser": loser, 
		}
		await self.send(text_data=json.dumps(response))