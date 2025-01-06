#!/bin/bash

cleanup() {
    echo "Cleaning up..."
    kill ${POSTGRES_PID}
    exit 0
}

trap cleanup SIGINT SIGTERM

chown -R postgres:postgres /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data/*

postgres -D /var/lib/postgresql/data &
POSTGRES_PID=$!

psql -U postgres << EOF
    CREATE DATABASE ${POSTGRES_DB};

    CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
    ALTER USER ${POSTGRES_USER} WITH LOGIN;

    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
    \c ${POSTGRES_DB}
    GRANT ALL ON SCHEMA public TO ${POSTGRES_USER};
EOF

echo "PostgreSQL setup completed"
echo ${POSTGRES_USER}
echo ${POSTGRES_PASSWORD}
echo ${POSTGRES_DB}

# psql -U postgres

# postgres -D /var/lib/postgresql/data
wait ${POSTGRES_PID}
