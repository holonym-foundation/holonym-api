FROM node:18.9.0-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev

COPY . .

EXPOSE 3010

CMD ["dumb-init", "node", "./src/server"]
