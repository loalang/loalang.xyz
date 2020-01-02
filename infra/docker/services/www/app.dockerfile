FROM www-builder AS builder

FROM fholzer/nginx-brotli
COPY infra/docker/services/www/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /project/build /usr/share/nginx/html
