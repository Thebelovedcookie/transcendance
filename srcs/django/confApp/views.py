from django.shortcuts import render
from django.http import JsonResponse


#here we can put the logic of our game
#here we should received info abnout the moovement and give back the new position of everything as json.file
def blabla(request):
	
	return JsonResponse({
    "playerOne": {
      "x": 50,
      "y": 100
    },
    "playerTwo": {
      "x": 450,
      "y": 100
    },
    "ball": {
      "x": 250,
      "y": 150
    }
  }
)
	