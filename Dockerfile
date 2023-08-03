FROM node:18-alpine as dev
WORKDIR /app
# COPY ["package.json", "tsconfig*.json" "./"]
COPY tsconfig*.json ./
COPY package*.json ./
RUN npm install
COPY src/ src/
RUN npm run build

FROM node:16-alpine as prod
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=dev /app/dist/ ./dist/
CMD ["node", "dist/main.js"]