FROM python:3.8-slim

RUN apt-get update -y && apt-get install gcc -y && pip install --upgrade pip

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY tools/ .

RUN python -m venv .env && \
	echo "source .env/bin/activate" >> .bashrc && \
	pip3 install -r ./dependencies.txt

RUN mkdir -p /etc/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout  /etc/ssl/backend.key -subj "/C=MA/ST=Martil/L=Martil/O=42Network/OU=1337/CN=ft_transcendence" -out /etc/ssl/backend.crt

RUN chmod +x script.sh

ENTRYPOINT ["/script.sh"]
