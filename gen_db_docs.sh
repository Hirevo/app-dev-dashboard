#!/bin/bash

java -jar /Users/nicolaspolomack/Downloads/schemaspy-6.0.0.jar \
     -t mariadb\
     -db dashboard\
     -host 0.0.0.0\
     -port 3306\
     -s dashboard\
     -u dashboard\
     -p '8t1zLlN+RKZ5bFsBioJmhdA4hFvQxECO'\
     -o docs/database\
     -hq\
     -gv /usr/local/Cellar/graphviz/2.40.1/\
     -renderer ':quartz'
