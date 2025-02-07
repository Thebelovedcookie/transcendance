from channels.generic.websocket import WebsocketConsumer
import random
import time
import json
import logging
import math

logger = logging.getLogger(__name__)
      
        
class GameMultiConsumer(WebsocketConsumer):
    #connection to the WebSocket
    def connect(self):
        logger.info("WebSocket connection attempt")
        try:
            self.accept()
            logger.info("WebSocket connection accepted")
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")

    #interrupt the Websocket
    def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected with code: {close_code}")

    #Manage the info receive
    def receive(self, text_data):
        logger.info(f"Received WebSocket data: {text_data}")
        try:
            # Decode Json data
            data = json.loads(text_data)
            logger.debug(f"Decoded data: {data}")

            # search for the type of the message
            message_type = data.get("type")
            print(f"Message type received: {message_type}")

            # Manage the type of the msg
            if message_type == "game.starting":
                response = self.initialisation(data)
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

    def initialisation(self, data):
        start_data = data.get("start", {})
        canvas_height = start_data.get("windowHeight", 0)
        canvas_width = start_data.get("windowWidth", 0)
        
        response = {
            "type": "game.starting",
            "player1": {
                "color": "red",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": 0,
                "endAngle": math.pi / 6,
                "startZone": 0,
                "endZone": 2 * math.pi / 3,
                "width": 15,
            },
            "player2": {
                "color": "blue",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": ((2 * math.pi) / 3),
                "endAngle": ((2 * math.pi) / 3) + (math.pi / 6),
                "startZone": 2 * math.pi / 3,
                "endZone": 4 * math.pi / 3,
                "width": 15,
            },
            "player3": {
                "color": "green",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": (4 * math.pi) / 3,
                "endAngle": (4 * math.pi) / 3 + math.pi / 6,
                "startZone": 4 * math.pi / 3,
                "endZone": 2 * math.pi,
                "width": 15,
            },
            "ball": {
                "x": canvas_width / 2,
                "y": canvas_height / 2,
                "width": 15,
                "height": 15,
                "color": "black",
                "speed": 6,
                "gravity": 3,
            },
            "scores": {
                "playerOne": 0,
                "playerTwo": 0,
                "playerThree": 0,
                "scoreMax": 5,
            }
        }
        return response