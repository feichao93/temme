FROM node:latest

WORKDIR /usr/src/app
COPY . .
RUN yarn install
RUN yarn package-website
WORKDIR /usr/src/app/dist

EXPOSE 3000

CMD ["node", "index.js"]
