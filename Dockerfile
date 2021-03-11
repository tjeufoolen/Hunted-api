FROM node:latest

COPY . /api
WORKDIR /api
RUN npm install --also=dev

CMD ["npm", "run", "dev"]