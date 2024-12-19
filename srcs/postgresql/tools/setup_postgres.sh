#!/bin/bash

psql -U postgres <<-EOSQL
CREATE ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
EOSQL

# psql -U postgres

postgres -D /var/lib/postgresql/data