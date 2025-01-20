from channels.generic.websocket import WebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class GameConsumer(WebsocketConsumer):
    
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
            elif message_type == "game.ballBounce":
                response = self.ballBounce(data)
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
        window_height = start_data.get("windowHeight", 0)
        window_width = start_data.get("windowWidth", 0)
        typeOfMatch = start_data.get("typeOfMatch", 0)

        if (typeOfMatch == "tournament"):
            response = {
                "type": "game.starting",
                "player1": {
                    "x": 5,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "player2": {
                    "x": window_width - 20,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "ball": {
                    "x": window_width / 2,
                    "y": window_height / 2,
                    "width": 15,
                    "height": 15,
                    "color": "black",
                    "speed": 8,
                    "gravity": 3,
                },
                "scores": {
                    "playerOne": 0,
                    "playerTwo": 0,
                    "scoreMax": 5,
                }
            }
        else:
            response = {
                "type": "game.starting",
                "player1": {
                    "x": 5,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "player2": {
                    "x": window_width - 20,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "ball": {
                    "x": window_width / 2,
                    "y": window_height / 2,
                    "width": 15,
                    "height": 15,
                    "color": "black",
                    "speed": 8,
                    "gravity": 3,
                },
                "scores": {
                    "playerOne": 0,
                    "playerTwo": 0,
                    "scoreMax": 10,
                }
            }
        return response

    def ballBounce(self, data):
        ball = data.get("start", {}).get("ball", {})

        ball["gravity"] = ball["gravity"] * (-1)
        ball["y"] += ball["gravity"]
        ball["x"] += ball["speed"]
        return {
            "type": "game.ballBounce",
            "ball": ball,
        }
    
class TournamentConsumer(WebsocketConsumer):
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
            if message_type == "tournament.starting":
                response = self.initialisation(data)
            # if message_type == "tournament.winner":
            #     response = self.eliminate(data)
            # elif message_type == "tournament.":
            #     response = self.ballBounce(data)
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
        numberOfPlayer = start_data.get("numberPlayer", 0)
        players = start_data.get("players", [])

        numberOfMatch = numberOfPlayer - 1

        response = {
                "type": "tournament.match",
                "numberOfMatch": numberOfMatch,
                "match": 1,
                "playerOne": players[0],
                "playerTwo": players[1],
            }
        return response
    def eliminate(self, data):
        start_data = data.get("start", {})
        eliminated = start_data.get("eliminated", 0)
        winner = start_data.get("winner", 0)
        
    #systeme par phase
        

     
        