FROM mariadb:10.3.10

LABEL Cédric & Nicolas

WORKDIR /docker-entrypoint-initdb.d

COPY dashboard.sql .

WORKDIR /srv/mariadb

EXPOSE 3306
