FROM node:23.11.0-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=5001
EXPOSE 5001
CMD ["npm", "run", "dev"]
