import json
import uuid
import logging
import random
import time 
import asyncio
import math

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from pong_history_app.models import PongMatchHistory
from user_management_app.models import CustomUser

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
	infoPlayer = {
		"players": []
	}
	infoMatch = {
		"match": []
	}

	game_group_name = "game_group"
	players = {}

	async def connect(self):
		self.player_id = self.scope["user"].id
		await self.accept()
		obj = {
			'player_id': self.player_id,
			'client': self.scope["client"]
		}
		self.infoPlayer['players'].append(obj)
		await self.channel_layer.group_add(self.game_group_name, self.channel_name)
		if len(self.infoPlayer["players"]) % 2 == 0:
			await self.send(
				text_data=json.dumps({
					"type": "playerId", "playerId": self.player_id,
				})
			)
			await self.createGame()
		else:
			await self.send(
				text_data=json.dumps({
					"type": "playerId", "playerId": self.player_id,
					'message': 'Waiting for Opponent',
				})
			)

	async def disconnect(self, close_code):
		client = self.scope["client"]
		toRemove = next((c for c in self.infoPlayer["players"] if c["client"] == client), None)

		if (toRemove):

			findMatch = next(
			(m for m in self.infoMatch["match"] 
				if m["playerOne"]["id"] == toRemove["player_id"] 
				or m["playerTwo"]["id"] == toRemove["player_id"]), 
			None)
			
		#changing the color of the player who's disconnect
		if findMatch and findMatch["playerOne"]["id"] == toRemove["player_id"]:
			findMatch["playerOne"]["color"] = "red"

		if findMatch and findMatch["playerTwo"]["id"] == toRemove["player_id"]:
			findMatch["playerTwo"]["color"] = "red"


	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			message_type = data.get("type")

			if message_type == "game.starting":
				matchId = await self.initialisation(data)
				asyncio.create_task(self.loop(matchId))
				return
			elif message_type == "player.moved":
				await self.moveChange(data)
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			# Envoyer la réponse au client
			await self.send(text_data=json.dumps(response))

		except json.JSONDecodeError:
			await self.send(text_data=json.dumps({
				"type": "error",
				"message": "Invalid JSON format"
			}))

    ####################### INIT MATCH ############################

	####################### INIT MATCH ############################

	#send to all of our players
	async def createGame(self):
		newPlayers = self.infoPlayer["players"][-2:]
		obj = {
			'status': True,
			'matchId' : str(uuid.uuid4()),
			'playerOne': {
				"id": newPlayers[0]['player_id'],
				"side": "left",
				"ctrlUp": "w",
				"ctrlDown": "s"
			},
			'playerTwo': {
				"id": newPlayers[1]['player_id'],
				"side": "right",
				"ctrlUp": "ArrowUp",
				"ctrlDown": "ArrowDown"
			}
		}
		self.infoMatch['match'].append(obj)
		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_init",
				"message": obj
			}
		)

	async def game_init(self, event):
		await self.send(text_data=json.dumps({
			"type": "game.init",
			"message": event["message"]
		}))

	######################## GAME LOOP #############################

	async def loop(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		while (m["status"]):
			await asyncio.sleep(1 / 60)
			await self.calculBallMovement(matchId)
			await self.send_gamestate(matchId)

	################### GAME SEND GAMESTATE ########################

	async def send_gamestate(self, matchId):
		matchPlayed = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if matchPlayed:
			response = {
				"matchId": matchPlayed["matchId"],
				"playerOne": matchPlayed["playerOne"],
				"playerTwo": matchPlayed["playerTwo"],
				"ball": matchPlayed["ball"],
				"scores": {"scoreMax": 10}
			}
			await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_state",
				"message": response
			})

	async def game_state(self, event):
		await self.send(text_data=json.dumps({
			"type": "game_state",
			"message": event["message"]
		}))

	####################### GAME LOGIC #############################
	#m = match
	async def calculBallMovement(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if m:
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
		if (m["playerOne"]["score"] == 10):
			m["status"] = False
			await self.sendMatchResult(m, m["playerOne"], m["playerTwo"])
			await self.cleanArray(m)
			# Record match history directly
			await self.record_match_history(
				user_id=m["playerOne"]["id"],
				opponent_id=m["playerTwo"]["id"],
				user_score=m["playerOne"]["score"],
				opponent_score=m["playerTwo"]["score"]
			)
		elif (m["playerTwo"]["score"] == 10):
			m["status"] = False
			await self.sendMatchResult(m, m["playerTwo"], m["playerOne"])
			await self.cleanArray(m)
			# Record match history directly
			await self.record_match_history(
				user_id=m["playerOne"]["id"],
				opponent_id=m["playerTwo"]["id"],
				user_score=m["playerOne"]["score"],
				opponent_score=m["playerTwo"]["score"]
			)

	async def record_match_history(self, user_id, opponent_id, user_score, opponent_score):
		@database_sync_to_async
		def save_match_history():
			user = CustomUser.objects.get(id=user_id)
			opponent = CustomUser.objects.get(id=opponent_id)

			# Record match from user's perspective
			PongMatchHistory.objects.create(
				user=user,
				opponent=opponent,
				user_score=user_score,
				opponent_score=opponent_score
			)

			# Record match from opponent's perspective
			PongMatchHistory.objects.create(
				user=opponent,
				opponent=user,
				user_score=opponent_score,
				opponent_score=user_score
			)

		try:
			await save_match_history()
		except Exception as e:
			logger.error(f"Failed to record match history: {str(e)}")

	async def cleanArray(self, m):
		p1 = next((p for p in self.infoPlayer["players"] if p["player_id"] == m["playerOne"]["id"]), None)
		if p1:
			self.infoPlayer["players"].remove(p1)

		p2 = next((p for p in self.infoPlayer["players"] if p["player_id"] == m["playerTwo"]["id"]), None)
		if p2:
			self.infoPlayer["players"].remove(p2)
		self.infoMatch["match"].remove(m)

	#################### SEND VICTORY ##########################

	async def sendMatchResult(self, m, winner, loser):
		response = {
			"matchId": m["matchId"],
			"winner": winner,
			"loser": loser, 
		}
		await self.channel_layer.group_send(
		self.game_group_name,
		{
			"type": "game_result",
			"message": response
		})

	async def game_result(self, event):
		await self.send(text_data=json.dumps({
			"type": "game_result",
			"message": event["message"]
		}))

	#################### PLAYER MOVE ##########################

	async def moveChange(self, data):
		matchId = data.get("matchId", None)
		ma = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if ma:
			playerId = data.get("playerId")
			if (ma["playerOne"]["id"] == playerId):
				direction = data.get("direction")
				if (direction == "up" and ma["playerOne"]["y"] > 0):
					ma["playerOne"]["y"] -= 10
				elif (direction == "down" and ma["playerOne"]["y"] < ma["canvas"]["canvas_height"] - ma["playerOne"]["height"]):
					ma["playerOne"]["y"] += 10
			elif (ma["playerTwo"]["id"] == playerId):
				direction = data.get("direction")
				if (direction == "up" and ma["playerTwo"]["y"] > 0):
					ma["playerTwo"]["y"] -= 10
				elif (direction == "down" and ma["playerTwo"]["y"] < ma["canvas"]["canvas_height"] - ma["playerOne"]["height"]):
					ma["playerTwo"]["y"] += 10

	##################### INITIALISATION ##########################

	async def initialisation(self, data):
		matchId = data.get("matchId", None)
		matchPlaying = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if matchPlaying:
			canvas = data.get("canvas", {})
			playerId = data.get("playerId")
			canvas_height = canvas.get("canvasHeight", 0)
			canvas_width = canvas.get("canvasWidth", 0)

			matchPlaying["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width}
			if (matchPlaying["playerOne"]["id"] == playerId):
				matchPlaying["playerOne"].update({
					"id": playerId,
					"side": "left",
					"x": 5,
					"y": canvas_height * 0.4,
					"width": canvas_width / 80,
					"height": canvas_height / 6,
					"color": "black",
					"gravity": 2,
					"score": 0
					})
			elif (matchPlaying["playerTwo"]["id"] == playerId):
				matchPlaying["playerTwo"].update({
					"id": playerId,
					"side": "right",
					"x": canvas_width - 20,
					"y": canvas_height * 0.4,
					"width": canvas_width / 80,
					"height": canvas_height / 6,
					"color": "black",
					"gravity": 2,
					"score": 0
					})
			matchPlaying["ball"] = {
				"x": canvas_width / 2,
				"y": canvas_height / 2,
				"width": 15,
				"height": 15,
				"color": "black",
				"speed": 5,
				"gravity": 2
				}

			return matchId
