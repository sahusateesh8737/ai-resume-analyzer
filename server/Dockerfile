FROM node:22-bookworm

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
