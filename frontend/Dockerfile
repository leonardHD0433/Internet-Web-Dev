FROM node:22.11.0

WORKDIR /app

ENV NODE_ENV=development
ENV DEBUG=app:*

COPY package*.json ./

COPY . .

RUN npm ci

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]