FROM python:3.8-slim

RUN apt-get update -y && apt-get install gcc -y && pip install --upgrade pip

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# ENV DJANGO_SETTINGS_MODULE=setup.settings


COPY ./project /project
WORKDIR /project
COPY tools/dependencies.txt .

RUN python -m venv .env && \
	echo "source .env/bin/activate" >> ~/.bashrc && \
	pip3 install -r ./dependencies.txt && \
	python3 manage.py makemigrations && \
	python3 manage.py migrate

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "setup.asgi:application"]