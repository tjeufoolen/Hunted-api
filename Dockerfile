FROM node:latest

COPY . /api
WORKDIR /api
RUN npm install

CMD ["npm", "start"]