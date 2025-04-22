FROM node:23.11.0-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=5002
EXPOSE 5002

CMD ["npm", "run", "dev"]
