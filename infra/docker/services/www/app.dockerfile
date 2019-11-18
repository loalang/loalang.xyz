FROM www-builder AS builder

FROM nginx:alpine
COPY --from=builder /project/build /usr/share/nginx/html
