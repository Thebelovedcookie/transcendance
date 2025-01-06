FROM debian:11

#install nginx
RUN apt update && apt install curl nginx -y \
		&& apt clean && rm -rf /var/lib/apt/lists/*

#define work directories
WORKDIR /

#copy our conf on the default conf ?
COPY  ./conf/nginx.conf /etc/nginx/nginx.conf
COPY  ./tools/setup_nginx.sh /usr/local/bin/setup_nginx.sh

RUN chmod +x /usr/local/bin/setup_nginx.sh

EXPOSE 443

CMD ["/usr/local/bin/setup_nginx.sh"]



FROM debian:11

#install nginx
RUN apt update && apt install curl nginx -y \
		&& apt clean && rm -rf /var/lib/apt/lists/*

#define work directories
WORKDIR /

#copy our conf on the default conf ?
COPY  ./conf/nginx.conf /etc/nginx/nginx.conf
COPY  ./tools/setup_nginx.sh /usr/local/bin/setup_nginx.sh

RUN chmod +x /usr/local/bin/setup_nginx.sh

EXPOSE 443

CMD ["/usr/local/bin/setup_nginx.sh"]