FROM node:14-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get update || : && apt-get install python3 xserver-xorg-dev libxi-dev libxext-dev -y

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
EXPOSE 3100
COPY . .

CMD [ "node", "server.js" ]