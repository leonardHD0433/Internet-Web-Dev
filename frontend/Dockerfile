FROM node:22.9.0-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV DEBUG=app:*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]