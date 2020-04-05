FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --only=production

COPY . .

CMD ["yarn", "start"]
