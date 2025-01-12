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
    && apt clean && rm -rf /var/lib/apt/lists/*

RUN wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz

RUN tar -xvf Python-3.11.1.tgz

#install Python 3.11
RUN cd Python-3.11.1 && ./configure --enable-optimizations && make -j 2 && make altinstall

#install pip for Python3.11
RUN wget https://bootstrap.pypa.io/get-pip.py && python3.11 get-pip.py

RUN pip3.11 install django && pip install python-decouple

RUN mkdir project

RUN django-admin startproject backend_project project

RUN cd /project && python3.11 manage.py startapp backend_app

#config des urls
COPY ./confApp/urls.py /project/backend_app/urls.py
COPY ./confApp/views.py /project/backend_app/views.py
COPY ./confDjango/urls.py /project/backend_project/urls.py
COPY ./confDjango/settings.py /project/backend_project/settings.py

COPY /tools/setups_backend.sh /setups_backend.sh
RUN chmod +x /setups_backend.sh

EXPOSE 8000
RUN apt update && apt install -y postgresql-client
RUN pip install psycopg[binary]


ENTRYPOINT [ "/setups_backend.sh" ]
