FROM debian:11

RUN mkdir -p /project/templates/
RUN mkdir -p /project/static/

COPY ./templates/ /tmp/templates/
COPY ./static/ /tmp/static/
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
