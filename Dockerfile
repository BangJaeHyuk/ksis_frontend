FROM node:20 as build  
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .  
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm run build
  
FROM nginx:stable-alpine  

# RUN mkdir -p /var/www/certbot

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80  
CMD ["nginx", "-g", "daemon off;"]