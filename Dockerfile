FROM node:10 as builder

COPY . /app

RUN cd /app && \
    npm install -g yarn && \
    yarn global add expo-cli && \
    yarn && \
    expo build:web;



FROM nginx:stable

EXPOSE 8080

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/web-build /var/www

COPY --from=builder /app/.web-config/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]


