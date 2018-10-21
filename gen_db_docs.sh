#!/bin/bash

java -jar schemaspy-6.0.0.jar \
     -t mariadb \
     -dp ./mariadb-java-client-2.3.0.jar \
     -host 0 \
     -u root \
     -db dashboard \
     -p 3+012rASIs8ionXDZgbneitqlvQ3TIBY \
     -o ../Repositories/projects/tek3/app-dev/dashboard/docs/database/html \
     -s dashboard \
     -imageformat svg \
     -hq
