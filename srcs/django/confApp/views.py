from django.shortcuts import render

def index(request):
	return render(request, "tran_app/index.html")
