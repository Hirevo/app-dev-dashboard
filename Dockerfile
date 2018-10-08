FROM node:8

LABEL Cédric & Nicolas

# Create app directory
WORKDIR /usr/src/app

# Add server
COPY ./server ./server

# Install server
RUN npm install  --prefix ./server

# Add client
COPY ./client ./client

# Install client
RUN npm install --prefix ./client

# Install client
RUN npm run --prefix ./client build

COPY ./client/dist ./server/public

EXPOSE 5000

CMD [ "npm", "--prefix", "./server", "start" ]