FROM python:3.8-slim

RUN apt-get update -y && apt-get install gcc -y && pip install --upgrade pip

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY tools/ .

RUN python -m venv .env && \
	echo "source .env/bin/activate" >> .bashrc && \
	pip3 install -r ./dependencies.txt

RUN chmod +x script.sh

CMD ["/script.sh"]

