import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt

#here we can put the logic of our game
#here we should received info abnout the moovement and give back the new position of everything as json.file
def sendPosition(request):

    if request.method == "POST":
        try:
            # Récupérer les données JSON envoyées dans la requête
            body = json.loads(request.body)

            # Lecture des positions depuis la requête
            player_one = body.get("player1", {"x": 0, "y": 0, "width": 0, "height": 0, "color":"white", "gravity": 2})
            player_two = body.get("player2", {"x": 0, "y": 0, "width": 0, "height": 0, "color":"white", "gravity": 2})
            ball = body.get("ball1", {"x": 0, "y": 0, "width": 0, "height": 0, "color":"white", "speed":8, "gravity": 2})
            canvas = body.get("canvas1", {"height": 0, "width": 0})
            scores = body.get("scores1", {"playerOne": 0, "playerTwo": 0})
            p1up = body.get("p1up", False)
            p1down = body.get("p1down", False)
            p2up = body.get("p2up", False)
            p2down = body.get("p2down", False)

            # Déplacement des joueurs
            if p1up and player_one["y"] - player_one["gravity"] > 0:
                player_one["y"] -= player_one["gravity"] * 7
            if p1down and player_one["y"] + player_one["height"] + player_one["gravity"] < canvas["height"]:
                player_one["y"] += player_one["gravity"] * 7
            if p2up and player_two["y"] - player_two["gravity"] > 0:
                player_two["y"] -= player_two["gravity"] * 7
            if p2down and player_two["y"] + player_two["height"] + player_two["gravity"] < canvas["height"]:
                player_two["y"] += player_two["gravity"] * 7

            # Rebond de la balle contre les murs haut et bas
            if ball["y"] + ball["gravity"] <= 0 or ball["y"] + ball["gravity"] >= canvas["height"]:
                ball["gravity"] = -ball["gravity"]  # Inverser la direction
                ball["y"] += ball["gravity"]
                ball["x"] += ball["speed"]
            else:
                ball["y"] += ball["gravity"]
                ball["x"] += ball["speed"]

            # Collision avec les raquettes ou dépassement
            if (
                (ball["y"] + ball["gravity"] <= player_two["y"] + player_two["height"] and
                 ball["x"] + ball["width"] + ball["speed"] >= player_two["x"] and
                 ball["y"] + ball["gravity"] > player_two["y"]) or
                (ball["y"] + ball["gravity"] >= player_one["y"] and
                 ball["y"] + ball["gravity"] <= player_one["y"] + player_one["height"] and
                 ball["x"] + ball["speed"] <= player_one["x"] + player_one["width"])
            ):
                ball["speed"] = -ball["speed"]  # Inverser la direction
            elif ball["x"] + ball["speed"] < player_one["x"]:  # La balle dépasse le joueur 1
                scores["playerTwo"] += 1
                ball = reset_ball(canvas)  # Réinitialiser la balle
            elif ball["x"] + ball["speed"] > player_two["x"] + player_two["width"]:  # La balle dépasse le joueur 2
                scores["playerOne"] += 1
                ball = reset_ball(canvas)  # Réinitialiser la balle

            # Retourner les positions mises à jour dans une réponse JSON
            return JsonResponse({
                "player1": player_one,
                "player2": player_two,
                "ball1": ball,
                "scores1": scores
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


#Réinitialise la position et les propriétés de la balle.
def reset_ball(canvas):
    return {
        "x": canvas["width"] // 2,
        "y": canvas["height"] // 2,
        "gravity": 5,  # Valeur par défaut
        "speed": 5,  # Valeur par défaut
        "width": 10  # Largeur par défaut
    }