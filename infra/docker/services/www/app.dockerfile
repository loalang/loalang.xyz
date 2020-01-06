FROM www-builder AS builder

FROM fholzer/nginx-brotli
COPY infra/docker/services/www/nginx.conf /etc/nginx/nginx.conf
COPY infra/docker/services/www/mime.types /etc/nginx/mime.types
COPY --from=builder /project/build /usr/share/nginx/html
