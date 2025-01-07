# Use a Debian-based image
FROM debian:11

# Install prerequisites
RUN apt-get update && apt-get install -y wget gnupg2

# Add PostgreSQL APT repository
RUN wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Update package list and install PostgreSQL
RUN apt-get update && apt-get install -y postgresql postgresql-common postgresql-contrib

# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Create data directory and set permissions
RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql

COPY ./conf/postgresql.conf /etc/postgresql/17/main/postgresql.conf

COPY ./tools/setup_postgres.sh /setup_postgres.sh
RUN chmod +x /setup_postgres.sh

COPY ./conf/pg_hba.conf /etc/postgresql/17/main/pg_hba.conf
# COPY ./conf/.my_pgpass /var/lib/postgresql/.pgpass
# COPY ./conf/.pg_service.conf /var/lib/postgresql/.pg_service.conf
# RUN chmod 0600 /var/lib/postgresql/.pgpass

# Switch to postgres user to initialize the database
USER postgres

# Ensure the PostgreSQL binaries are in the PATH
ENV PATH="/usr/lib/postgresql/17/bin:$PATH"

# Initialize the database cluster
RUN /usr/lib/postgresql/17/bin/initdb -D /var/lib/postgresql/data

EXPOSE 5432

ENTRYPOINT [ "/setup_postgres.sh" ]
