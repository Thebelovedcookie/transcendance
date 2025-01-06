DC = docker-compose.yml

all: clean creat_v build up

network:
	@docker compose -f $(DC) up -d $(c)

creat_v:
	@sudo mkdir -p $(HOME)/ecole_42/transcendence/data/postgresql_volume
	@sudo mkdir -p $(HOME)/ecole_42/transcendence/data/django_volume
	@sudo chown -R $(USER) $(HOME)/ecole_42/transcendence/data
	@sudo chmod -R 777 $(HOME)/ecole_42/transcendence/data/postgresql_volume
	@sudo chmod -R 755 $(HOME)/ecole_42/transcendence/data/django_volume

build:
	@docker compose -f $(DC) build $(c)

up: network
	@docker compose -f $(DC) up -d $(c)

start:
	@docker compose -f $(DC) start $(c)

down:
	@docker compose -f $(DC) down $(c)

destroy:
	@docker compose -f $(DC) down -v $(c)

stop:
	@docker compose -f $(DC) stop $(c)

restart:
	@docker compose -f $(DC) stop $(c)
	@docker compose -f $(DC) up -d $(c)

logs:
	@docker compose -f $(DC) logs --tail=100 -f $(c)

ps:
	@docker compose -f $(DC) ps

login:
	@docker compose -f $(DC) exec $(c) /bin/bash

clean: destroy
	@sudo rm -rf $(HOME)/ecole_42/transcendence/data/postgresql_volume
	@sudo rm -rf $(HOME)/ecole_42/transcendence/data/django_volume

help:
	@echo    "build  : Services are built once and then tagged, by default as project-service."
	@echo    "up     : Builds, (re)creates, starts, and attaches to containers for a service."
	@echo    "start  : Starts existing containers for a service."
	@echo    "down   : Stops containers and removes containers, networks, volumes, and images created by up."
	@echo    "destroy: Remove named volumes declared in the "volumes" section of the Compose file and anonymous volumes attached to containers."
	@echo    "stop   : Stops running containers without removing them. They can be started again with docker compose start."
	@echo    "restart: Restarts existing containers for a service."
	@echo    "logs   : Displays log output from services."
	@echo    "ps     : Lists containers for a Compose project, with current status and exposed ports."
	@echo    "login  : This is the equivalent of docker exec targeting a Compose service."

.PHONY: help build up start down destroy stop restart logs logs-api ps login-timescale login-api db-shell
