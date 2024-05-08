FROM node:22

COPY package.json package-lock.json .
RUN npm install

COPY index.js .

CMD ["node", "index.js"]
