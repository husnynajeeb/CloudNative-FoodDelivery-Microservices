FROM node:23.11.0-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=5004
EXPOSE 5004
CMD ["npm", "run", "dev"]
