import json
import uuid
import logging
import random
import time
import asyncio
import math

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
        self.player_id = str(uuid.uuid4())
        await self.accept()
        obj = {
            'player_id': self.player_id,
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
        async_to_sync(self.channel_layer.group_discard)(
            self.game_group_name, self.channel_name
        )

    async def receive(self, text_data):
        # logger.info(f"Received WebSocket data: {text_data}")
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "game.starting":
                matchId = await self.initialisation(data)
                # logger.info(f"Match initialized with ID: {matchId}")
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
            logger.error("Error: Invalid JSON received")
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))

    ####################################################

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

    ####################################################
    #send to all of our players
    async def createGame(self):
        newPlayers = self.infoPlayer["players"][-2:]
        obj = {
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

    ####################################################
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
                matchPlaying["playerOne"].update({"id": playerId, "side": "left", "x": 5, "y": canvas_height * 0.4, "width": canvas_width / 80, "height": canvas_height / 6, "color": "black", "gravity": 2, "score": 0})
            elif (matchPlaying["playerTwo"]["id"] == playerId):
                matchPlaying["playerTwo"].update({"id": playerId, "side": "right", "x": canvas_width - 20, "y": canvas_height * 0.4, "width": canvas_width / 80, "height": canvas_height / 6, "color": "black", "gravity": 2, "score": 0})
            matchPlaying["ball"] = { "x": canvas_width / 2, "y": canvas_height / 2, "width": 15, "height": 15, "color": "black", "speed": 5, "gravity": 2 }

            return matchId
        
    async def send_gamestate(self, matchId):
        matchPlayed = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

        if matchPlayed:
            # logger.info(f"Sending game state for match {matchId}")
            response = {
                "type": "game.starting",
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
        # logger.info(f"Game state received: {event['message']}")
        await self.send(text_data=json.dumps({
            "type": "game_state",
            "message": event["message"]
        }))

    async def loop(self, matchId):
        # logger.info(f"Loop started for match {matchId}")
        while (True):
            await asyncio.sleep(1 / 60)
            await self.calculBallMovement(matchId)
            await self.send_gamestate(matchId)

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
            logger.info("bounce right")

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
            logger.info("bounce left")
        elif (m["ball"]["x"] + m["ball"]["speed"] < m["playerOne"]["x"]):
            m["playerTwo"]["score"] += 1
            m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
            m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2
        elif (m["ball"]["x"] + m["ball"]["speed"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
            m["playerOne"]["score"] += 1
            m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
            m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2