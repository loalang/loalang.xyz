FROM www-builder AS builder

FROM nginx:alpine
COPY infra/docker/services/www/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /project/build /usr/share/nginx/html
