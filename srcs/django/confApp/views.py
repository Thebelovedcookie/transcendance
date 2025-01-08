from django.shortcuts import render

def index(request):
	return render(request, "tran_app/index.html")

def home(request):
	return render(request, "tran_app/home.html")

def pong(request):
	return render(request, "tran_app/pong/index.html")

def pong_normal(request):
	return render(request, "tran_app/pong/normal.html")

def pong_solo(request):
	return render(request, "tran_app/pong/solo.html")
