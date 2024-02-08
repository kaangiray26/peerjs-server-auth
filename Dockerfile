FROM node:19-alpine
WORKDIR /messenger-push

# Copy files
ADD js ./js
ADD package.json ./
ADD server.js ./

# RUN npm install
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]