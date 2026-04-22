FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build 

# ENV NODE_ENV=production 

EXPOSE 3030

CMD ["node", "dist/main"]