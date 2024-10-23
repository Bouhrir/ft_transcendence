FROM nginx:bookworm

RUN apt-get install -y openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout  /etc/nginx/ssl/transcendence.key -subj "/C=MA/ST=Martil/L=Martil/O=42Network/OU=1337/CN=ft_transcendence" -out /etc/nginx/ssl/transcendence.crt

COPY conf/nginx.conf /etc/nginx/conf.d/

CMD ["nginx", "-g", "daemon off;"]