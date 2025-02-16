FROM debian:11

RUN apt update && apt install -y \
	tar gzip build-essential \
	zlib1g-dev \
	libncurses5-dev \
	libgdbm-dev \
	libnss3-dev \
	libssl-dev \
	libreadline-dev \
	libffi-dev \
	libsqlite3-dev \
	wget \
	libbz2-dev \
	python3 \
	gettext \
	&& apt clean && rm -rf /var/lib/apt/lists/*

RUN wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz

RUN tar -xvf Python-3.11.1.tgz

#install Python 3.11
RUN cd Python-3.11.1 && ./configure --enable-optimizations && make -j 2 && make altinstall

#install pip for Python3.11
RUN wget https://bootstrap.pypa.io/get-pip.py && python3.11 get-pip.py

RUN pip3.11 install django && pip install python-decouple
#RUN apt-get update && apt-get install -y gettext
RUN mkdir project
#WORKDIR /project
#RUN mkdir -p /project/locale
RUN django-admin startproject backend_project project

RUN cd /project && python3.11 manage.py startapp backend_app \
	 && python3.11 manage.py startapp backend_gamecons_app \
	 && python3.11 manage.py startapp backend_tour_app \
	 && python3.11 manage.py startapp usrman_app \
	 && python3.11 manage.py startapp pong_history_app 
	
RUN apt update && apt install -y postgresql-client
RUN pip install psycopg[binary] channels[daphne] django-cors-headers Pillow
#config des urls
COPY ./backendApp /project/backend_app/
COPY ./pongHistoryApp /project/pong_history_app/
COPY ./backendProject /project/backend_project/
COPY ./backendGameConsApp /project/backend_gamecons_app/
COPY ./backendTourApp /project/backend_tour_app/
COPY ./tools/setups_backend.sh /setups_backend.sh
COPY ./usrmanApp /project/usrman_app/
COPY ./locale /project/locale/

WORKDIR /project

ENV PYTHONPATH=/project
# Vérifier le chemin Python et la présence du module
#RUN python3.11 -c "import sys; print(sys.path)"
#RUN python3.11 -c "import backend_project.settings"
#RUN ls -l /project/backend_project && python3.11 -c "import backend_project.settings"

RUN for lang in fr es ja; do \
    django-admin makemessages -l $lang --verbosity 2 --keep-pot \
    --settings=backend_project.settings -d django --extension=html,py \
	--ignore=venv --no-location --no-wrap --locale=$lang; \
done


RUN django-admin compilemessages -i venv --settings=backend_project.settings

EXPOSE 8000


RUN chmod +x /setups_backend.sh

# fichiers de traduction des langues 








ENTRYPOINT [ "/setups_backend.sh" ]
