FROM nginx:bookworm

COPY conf/nginx.conf /etc/nginx/conf.d/

EXPOSE 8001

CMD ["nginx", "-g", "daemon off;"]