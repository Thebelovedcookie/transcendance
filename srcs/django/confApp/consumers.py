from channels.generic.websocket import WebsocketConsumer
import json

class MyWebSocketConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({"message": "Connexion acceptée"}))

    def disconnect(self, close_code):
        print(f"Connexion fermée : {close_code}")

    def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Message reçu : {data}")
        self.send(text_data=json.dumps({"message": "Données reçues"}))