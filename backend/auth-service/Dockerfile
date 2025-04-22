FROM node:23.11.0-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "dev"]