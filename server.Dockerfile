FROM node:10

LABEL Cédric & Nicolas

# Create app directory
WORKDIR /srv/server

# Copy files over to the container
COPY . .

# Install dependancies
RUN npm install

EXPOSE 5000

CMD [ "npm", "start" ]
