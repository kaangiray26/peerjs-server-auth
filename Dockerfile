FROM node:20.11.0-alpine
WORKDIR /messenger-push

# Copy files
ADD peerjs ./peerjs
ADD package.json ./

# RUN npm install
RUN npm install

EXPOSE 3000

CMD ["node", "peerjs/messenger.js"]