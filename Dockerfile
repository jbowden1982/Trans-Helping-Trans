FROM node:10 as builder

RUN npm install -g yarn && \
    yarn global add expo-cli && \
    yarn && \
    expo build:web;

COPY . /app

FROM nginx:stable

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/web-build /var/www

COPY /app/.web-config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8888;

CMD ["nginx", "-g", "daemon off;"]


