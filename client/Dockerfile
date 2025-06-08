# client/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и lock файл
COPY client/package.json ./package.json
COPY client/package-lock.json ./package-lock.json

# Устанавливаем зависимости через npm
RUN npm install

# Копируем исходники
COPY client/src ./src
COPY client/vite.config.ts ./
COPY client/tsconfig.json ./tsconfig.json 
COPY client/index.html ./index.html

# Сборка
RUN npm run build

# Используем Nginx для отдачи статики
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]