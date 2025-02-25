from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import random
import time
import json
import logging
import asyncio
import math

logger = logging.getLogger(__name__)

class GameAiConsumer(AsyncWebsocketConsumer):
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
			await self.send(text_data=json.dumps(response))

		except json.JSONDecodeError:
			logger.error("Error: Invalid JSON received")
			self.send(text_data=json.dumps({
				"type": "error",
				"message": "Invalid JSON format"
			}))

	######################## GAME INIT #############################

	# initialize all characteristics of players and ball
	# based on info of window size
	async def initialisation(self, data):
		start_data = data.get("start", {})
		canvas_height = start_data.get("windowHeight", 0)
		canvas_width = start_data.get("windowWidth", 0)

		obj = {
				'status': "True",
				'playerOne': {
				},
				'playerTwo': {
				}
			}
		self.infoMatch['match'].append(obj)
		m = self.infoMatch["match"][0]

		canvas_dim = min(canvas_height, canvas_width)
		size = int(canvas_dim  / 45)

		m["maxScore"] = 10
		m["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width, "size": size}
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
			"width": size,
			"height": size,
			"color": "black",
			"speed": 5,
			"gravity": 2,
			"vx": 0,
			"vy": 2
			}

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
		if m["status"] == "True":
			try:
				await self.send(text_data=json.dumps(response))
			except Exception as e:
				m["status"] = "False"
	
	######################## GAME LOGIC #############################

	#check if movement in y-dir result in wall impact
	def at_wall(self):
		m = self.infoMatch["match"][0]
		# top wall
		if m["ball"]["y"] + m["ball"]["vy"] <= 0:
			return True
		# bottom wall
		elif m["ball"]["y"] + m["ball"]["width"] + m["ball"]["vy"] >=  m["canvas"]["canvas_height"]:
			return True
		else:
			return False

	async def calculBallMovement(self):
		m = self.infoMatch["match"][0]

		# if impacting wall, reverse y velocity
		if self.at_wall():
			m["ball"]["vy"] *= -1
		m["ball"]["x"] += m["ball"]["speed"]
		m["ball"]["y"] += m["ball"]["vy"]
		await self.ballPaddleCollision(m)

	# update ball velocities and last touch following strike
	def executeBallStrike(self, m, player):
		factor = -1
		if player["x"] < m["canvas"]["canvas_width"] / 2:
			factor = 1
		paddleCenter = player["y"] + player["height"] / 2
		ballCenter = m["ball"]["y"] + m["ball"]["height"] / 2
		relativeIntersectY = (paddleCenter - ballCenter) / (player["height"] / 2)
		bounceAngle = relativeIntersectY * 0.75
		speed = math.sqrt(m["ball"]["speed"] * m["ball"]["speed"] + m["ball"]["vy"] * m["ball"]["vy"])
		m["ball"]["speed"] = factor * speed * math.cos(bounceAngle)
		m["ball"]["vy"] = speed * math.sin(bounceAngle)
		m["ball"]["x"] = player["x"] + factor * m["ball"]["width"]

	# place ball in center of canvas and give it a random initial velocity
	def resetBall(self, m):
		m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
		m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2


	# check if location of ball overlaps location of paddle
	def inPaddle(self, player):
		m = self.infoMatch["match"][0]

		if player["x"] > m["canvas"]["canvas_width"] / 2:
			if (m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
				and m["ball"]["x"] + m["ball"]["width"] + m["ball"]["speed"] >= player["x"]
				and m["ball"]["y"] + m["ball"]["vy"] > player["y"]):
				return True

		if player["x"] < m["canvas"]["canvas_width"] / 2:
			if (m["ball"]["y"] + m["ball"]["vy"] >= player["y"]
				and m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
				and m["ball"]["x"] + m["ball"]["speed"] <= player["x"] + player["width"]):
				return True

		return False

	async def ballPaddleCollision(self, m):
		if self.inPaddle(m["playerTwo"]):
			self.executeBallStrike(m, m["playerTwo"])
		elif self.inPaddle(m["playerOne"]):
			self.executeBallStrike(m, m["playerOne"])
		elif (m["ball"]["x"] + m["ball"]["speed"] < m["playerOne"]["x"]):
			m["playerTwo"]["score"] += 1
			self.resetBall(m)
			await self.checkScore(m)
		elif (m["ball"]["x"] + m["ball"]["speed"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
			m["playerOne"]["score"] += 1
			self.resetBall(m)
			await self.checkScore(m)
		
	async def checkScore(self, m):
		if (m["playerOne"]["score"] == m["maxScore"]):
			m["status"] = "False"
			await self.sendMatchResult("p1", "p2")
		elif (m["playerTwo"]["score"] == m["maxScore"]):
			m["status"] = "False"
			await self.sendMatchResult("p2", "p1")

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

	###################### RESULTS ##########################

	async def sendMatchResult(self, winner, loser):
		response = {
			"type" : "match.result",
			"winner": winner,
			"loser": loser,
		}
		await self.send(text_data=json.dumps(response))
