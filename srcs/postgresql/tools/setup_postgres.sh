#!/bin/bash

chown -R postgres:postgres /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data/*

psql -U postgres <<-EOSQL
CREATE ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
EOSQL

# psql -U postgres

postgres -D /var/lib/postgresql/data
