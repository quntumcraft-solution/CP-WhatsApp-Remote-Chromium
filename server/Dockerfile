FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY package.json ./

RUN npm install

COPY server.js ./

ENV PORT=10000

EXPOSE 10000

CMD ["node", "server.js"]
