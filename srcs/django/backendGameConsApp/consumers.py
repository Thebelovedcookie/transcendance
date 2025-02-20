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

	#Manage the info receive
	async def receive(self, text_data):
		logger.info(f"Received WebSocket data: {text_data}")
		try:

			logger.info("starting try")
			# Decode Json data
			data = json.loads(text_data)
			logger.debug(f"Decoded data: {data}")

			logger.info("got data")
			# search for the type of the message
			message_type = data.get("type")
			print(f"Message type received: {message_type}")

			# Manage the type of the msg
			if message_type == "game.starting":
				logger.info("game stating")
				await self.initialisation(data)
				logger.info("game init")
				asyncio.create_task(self.loop())
				return
			elif message_type == "player.moved":
				logger.info("player moved")
				await self.moveChange(data)
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			# Envoyer la réponse au client
			self.send(text_data=json.dumps(response))

		except json.JSONDecodeError:
			logger.info("failure")
			logger.error("Error: Invalid JSON received")
			self.send(text_data=json.dumps({
				"type": "error",
				"message": "Invalid JSON format"
			}))

	async def createGame(self):
		obj = {
			'status': True,
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

		m["maxScore"] = 10
		m["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width}
		if typeOfMatch == "tournement":
			m["maxScore"] = 5

		m["playerOne"].update({
			"x": 5,
			"y": canvas_height * 0.4,
			"width": canvas_width / 80,
			"height": canvas_height / 6,
			"color": "black",
			"gravity": 2,
			"score": 0
			})
		m["playerTwo"].update({
			"x": canvas_width - 20,
			"y": canvas_height * 0.4,
			"width": canvas_width / 80,
			"height": canvas_height / 6,
			"color": "black",
			"gravity": 2,
			"score": 0
			})
		m["ball"] = {
			"x": canvas_width / 2,
			"y": canvas_height / 2,
			"width": 15,
			"height": 15,
			"color": "black",
			"speed": 5,
			"gravity": 2
			}

	######################## GAME LOOP #############################

	async def loop(self):
		m = self.infoMatch["match"][0]

		while (m["status"]):
			await asyncio.sleep(1 / 60)
			await self.calculBallMovement()
			await self.send_gamestate()

	async def send_gamestate(self):
		m = self.infoMatch["match"][0]

		response = {
			"type" : "game.state",
			"playerOne": m["playerOne"],
			"playerTwo": m["playerTwo"],
			"ball": m["ball"],
			"scoreMax": m["maxScore"]
		}
		await self.send(text_data=json.dumps(response))

	async def calculBallMovement(self):
		m = self.infoMatch["match"][0]

		if (m["ball"]["y"] + m["ball"]["gravity"] <= 0
			or m["ball"]["y"] + m["ball"]["width"] + m["ball"]["gravity"]
			>=  m["canvas"]["canvas_height"]):
			m["ball"]["gravity"] *= -1
			m["ball"]["x"] += m["ball"]["speed"]
			m["ball"]["y"] += m["ball"]["gravity"]
		else:
			m["ball"]["x"] += m["ball"]["speed"]
			m["ball"]["y"] += m["ball"]["gravity"]
		await self.ballWallCollision(m)

	async def ballWallCollision(self, m):
		if (m["ball"]["y"] + m["ball"]["gravity"] <= m["playerTwo"]["y"] + m["playerTwo"]["height"]
			and m["ball"]["x"] + m["ball"]["width"] + m["ball"]["speed"] >= m["playerTwo"]["x"]
			and m["ball"]["y"] + m["ball"]["gravity"] > m["playerTwo"]["y"]):

			paddleCenter = m["playerTwo"]["y"] + m["playerTwo"]["height"] / 2
			ballCenter = m["ball"]["y"] + m["ball"]["height"] / 2
			relativeIntersectY = (paddleCenter - ballCenter) / (m["playerTwo"]["height"] / 2)

			bounceAngle = relativeIntersectY * 0.75

			speed = math.sqrt(m["ball"]["speed"] * m["ball"]["speed"] + m["ball"]["gravity"] * m["ball"]["gravity"])
			m["ball"]["speed"] = -speed * math.cos(bounceAngle)
			m["ball"]["gravity"] = speed * math.sin(bounceAngle)
			m["ball"]["x"] = m["playerTwo"]["x"] - m["ball"]["width"]

		elif (m["ball"]["y"] + m["ball"]["gravity"] >= m["playerOne"]["y"]
			and m["ball"]["y"] + m["ball"]["gravity"] <= m["playerOne"]["y"] + m["playerOne"]["height"]
			and m["ball"]["x"] + m["ball"]["speed"] <= m["playerOne"]["x"] + m["playerOne"]["width"]):

			paddleCenter = m["playerOne"]["y"] + m["playerOne"]["height"] / 2
			ballCenter = m["ball"]["y"] + m["ball"]["height"] / 2
			relativeIntersectY = (paddleCenter - ballCenter) / (m["playerOne"]["height"] / 2)

			bounceAngle = relativeIntersectY * 0.75

			speed = math.sqrt(m["ball"]["speed"] * m["ball"]["speed"] + m["ball"]["gravity"] * m["ball"]["gravity"])
			m["ball"]["speed"] = speed * math.cos(bounceAngle)
			m["ball"]["gravity"] = speed * math.sin(bounceAngle)
			m["ball"]["x"] = m["playerOne"]["x"] + m["ball"]["width"]

		elif (m["ball"]["x"] + m["ball"]["speed"] < m["playerOne"]["x"]):
			m["playerTwo"]["score"] += 1
			m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
			m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2
			await self.checkScore(m)

		elif (m["ball"]["x"] + m["ball"]["speed"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
			m["playerOne"]["score"] += 1
			m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
			m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2
			await self.checkScore(m)
	
	async def checkScore(self, m):
		logger.info("check score")
		if (m["playerOne"]["score"] == m["maxScore"]):
			m["status"] = False
			await self.sendGameState(m, "Player 1", "Player 2")
		elif (m["playerTwo"]["score"] == m["maxScore"]):
			m["status"] = False
			await self.sendGameState(m, "Player 2", "Player 1")

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

	async def sendGameState(self, m, winner, loser):
		logger.info("send match result") #somthing needs to be sent to js to signal the game is finished
		response = {
			"type": "game.result",
			"winner": winner,
			"loser": loser, 
		}
		await self.send(text_data=json.dumps(response))