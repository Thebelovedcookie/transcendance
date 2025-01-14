from channels.generic.websocket import WebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class GameConsumer(WebsocketConsumer):
    def connect(self):
        logger.info("WebSocket connection attempt")
        try:
            self.accept()
            logger.info("WebSocket connection accepted")
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")

    def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected with code: {close_code}")

    def receive(self, text_data):
        logger.info(f"Received WebSocket data: {text_data}")
        try:
            data = json.loads(text_data)
            print(f"Received data: {data}")

            response = {
                "type": "game.update",
                "player1": data.get("player1", {}),
                "player2": data.get("player2", {}),
                "ball": data.get("ball", {}),
                "scores": data.get("scores", {})
            }

            self.send(text_data=json.dumps(response))

        except json.JSONDecodeError:
            print("Error: Invalid JSON received")
            self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))
